import "server-only";
import QRCode from "qrcode";
import { sql } from "./db";
import type { AdminUser } from "./auth";
import { revokeOtherSessions } from "./auth";
import { notifyPasswordChanged } from "./notify";
import {
  audit,
  checkTotp,
  decrypt,
  encrypt,
  hashPassword,
  hashRecovery,
  newRecoveryCodes,
  newTotpSecret,
  passwordProblem,
  rateLimit,
  totpUri,
  verifyPassword,
} from "./security";

// Self-service account security: password, 2-step verification, sessions.

export class AccountError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

async function load(userId: string) {
  const [u] = await sql<{ email: string; name: string; password_hash: string; totp_enabled: boolean; totp_secret_enc: string | null; totp_last_step: string; recovery_codes: string[]; password_changed_at: Date }>(
    `SELECT email, name, password_hash, totp_enabled, totp_secret_enc, totp_last_step, recovery_codes, password_changed_at FROM admin_users WHERE id = $1`,
    [userId],
  );
  if (!u) throw new AccountError("Account not found.", 404);
  return u;
}

/** Re-checks the password before sensitive changes (and slows down guessing). */
async function confirmPassword(user: AdminUser, password: string, stored: string) {
  if (!(await rateLimit(`confirm:${user.id}`, 10, 900))) throw new AccountError("Too many attempts. Please wait 15 minutes.", 429);
  if (!(await verifyPassword(password, stored)).ok) throw new AccountError("Your current password isn't right.", 401);
}

export async function accountOverview(user: AdminUser) {
  const u = await load(user.id);
  return {
    email: u.email,
    name: u.name,
    totpEnabled: u.totp_enabled,
    recoveryCodesLeft: u.recovery_codes.length,
    passwordChangedAt: new Date(u.password_changed_at).toISOString(),
  };
}

export async function changePassword(user: AdminUser, current: string, next: string) {
  const u = await load(user.id);
  await confirmPassword(user, current, u.password_hash);
  if (current === next) throw new AccountError("The new password must be different from the current one.");
  const problem = await passwordProblem(next, { email: u.email, name: u.name });
  if (problem) throw new AccountError(problem);
  await sql(`UPDATE admin_users SET password_hash = $2, password_changed_at = now() WHERE id = $1`, [user.id, await hashPassword(next)]);
  // Any other device that knew the old password is signed out.
  await revokeOtherSessions(user);
  await audit("password.changed", user);
  await notifyPasswordChanged(u.email, u.name).catch(() => {});
}

/** Step 1 of turning on 2-step verification: a new secret + QR code (not active yet). */
export async function startTotpSetup(user: AdminUser) {
  const u = await load(user.id);
  if (u.totp_enabled) throw new AccountError("2-step verification is already on.");
  const secret = newTotpSecret();
  await sql(`UPDATE admin_users SET totp_secret_enc = $2, totp_last_step = 0 WHERE id = $1`, [user.id, encrypt(secret)]);
  const uri = totpUri(secret, u.email);
  return { qr: await QRCode.toDataURL(uri, { margin: 1, width: 220 }), secret: secret.replace(/(.{4})/g, "$1 ").trim() };
}

/** Step 2: the code from the app proves the phone is set up → turn it on, hand out recovery codes once. */
export async function confirmTotpSetup(user: AdminUser, code: string) {
  if (!(await rateLimit(`totp-setup:${user.id}`, 10, 900))) throw new AccountError("Too many attempts. Please wait 15 minutes.", 429);
  const u = await load(user.id);
  if (u.totp_enabled) throw new AccountError("2-step verification is already on.");
  if (!u.totp_secret_enc) throw new AccountError("Start the setup again.");
  const step = checkTotp(decrypt(u.totp_secret_enc), code, 0);
  if (step === null) throw new AccountError("That code isn't right. Make sure your phone's time is set automatically.");
  const codes = newRecoveryCodes();
  await sql(`UPDATE admin_users SET totp_enabled = true, totp_last_step = $2, recovery_codes = $3 WHERE id = $1`, [user.id, step, codes.map(hashRecovery)]);
  await revokeOtherSessions(user);
  await audit("mfa.enabled", user);
  return codes;
}

export async function disableTotp(user: AdminUser, password: string) {
  const u = await load(user.id);
  await confirmPassword(user, password, u.password_hash);
  await sql(`UPDATE admin_users SET totp_enabled = false, totp_secret_enc = NULL, recovery_codes = '{}' WHERE id = $1`, [user.id]);
  await audit("mfa.disabled", user);
}

export async function regenerateRecoveryCodes(user: AdminUser, password: string) {
  const u = await load(user.id);
  if (!u.totp_enabled) throw new AccountError("Turn on 2-step verification first.");
  await confirmPassword(user, password, u.password_hash);
  const codes = newRecoveryCodes();
  await sql(`UPDATE admin_users SET recovery_codes = $2 WHERE id = $1`, [user.id, codes.map(hashRecovery)]);
  await audit("mfa.recovery_regenerated", user);
  return codes;
}

export async function securityActivity(limit = 40) {
  const rows = await sql<{ at: Date; actor: string | null; action: string; target: string | null; ip: string | null; user_agent: string | null }>(
    `SELECT at, actor, action, target, ip, user_agent FROM audit_log ORDER BY at DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ ...r, at: new Date(r.at).toISOString() }));
}
