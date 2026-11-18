import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql, transaction } from "./db";
import {
  audit,
  checkTotp,
  clearRateLimit,
  decrypt,
  dummyHash,
  hashPassword,
  hashRecovery,
  newToken,
  rateLimit,
  requestInfo,
  sha256,
  verifyPassword,
} from "./security";
import { notifyNewSignIn } from "./notify";

// Admin accounts, sessions and sign-in.
//
// - Accounts live in Postgres. On first start they are created from the
//   ADMIN_USERS environment variable (email|Name|saltHex|hashHex, comma-separated).
// - Sessions are random 256-bit tokens; only their SHA-256 is stored, so
//   sessions can be listed and revoked, and a database leak can't log anyone in.
// - Sliding expiry: 7 days of inactivity, 30 days at most.

export type AdminUser = { id: string; email: string; name: string; totpEnabled: boolean; sessionId: string };

const IDLE_DAYS = 7;
const MAX_DAYS = 30;
const MFA_MINUTES = 5;
const LOCK_AFTER = 8;
const LOCK_MINUTES = 15;

const secure = process.env.NODE_ENV === "production";
/** "__Host-" makes the browser reject the cookie unless it's Secure, host-only and Path=/. */
export const COOKIE = secure ? "__Host-pfr_admin" : "pfr_admin";
const MFA_COOKIE = secure ? "__Host-pfr_mfa" : "pfr_mfa";

const cookieOpts = (maxAgeSec: number) => ({
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeSec,
});

export function authConfigured() {
  return Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

/** Creates the accounts from ADMIN_USERS the first time (when the table is empty). */
async function bootstrapUsers() {
  const [{ n }] = await sql<{ n: number }>("SELECT count(*)::int AS n FROM admin_users");
  if (n > 0) return;
  for (const row of (process.env.ADMIN_USERS || "").split(",").map((r) => r.trim()).filter(Boolean)) {
    const [email, name, salt, hash] = row.split("|");
    if (!email || !salt || !hash) continue;
    await sql(`INSERT INTO admin_users (email, name, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING`, [
      email.trim().toLowerCase(),
      (name || email.split("@")[0]).trim().slice(0, 80),
      `${salt}$${hash}`,
    ]);
  }
}

// ---------------------------------------------------------------------------
// Sessions

async function createSession(userId: string, mfaPending: boolean) {
  const { ip, ua } = await requestInfo();
  const token = newToken();
  const ttl = mfaPending ? `${MFA_MINUTES} minutes` : `${IDLE_DAYS} days`;
  await sql(
    `INSERT INTO admin_sessions (id, user_id, mfa_pending, expires_at, ip, user_agent) VALUES ($1, $2, $3, now() + $4::interval, $5, $6)`,
    [sha256(token), userId, mfaPending, ttl, ip, ua],
  );
  return token;
}

async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE, token, cookieOpts(IDLE_DAYS * 86400));
}

/** The signed-in admin for this request, or null. Cached per request. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  if (!authConfigured()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const id = sha256(token);
  const rows = await sql<{ id: string; email: string; name: string; totp_enabled: boolean; last_seen_at: Date; created_at: Date }>(
    `SELECT u.id, u.email, u.name, u.totp_enabled, s.last_seen_at, s.created_at
       FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.mfa_pending = false AND s.expires_at > now() AND u.disabled = false`,
    [id],
  ).catch((e) => {
    console.error("[auth] session lookup failed", (e as Error).message);
    return [];
  });
  const r = rows[0];
  if (!r) return null;
  // Slide the expiry at most every 10 minutes (keeps writes low).
  if (Date.now() - new Date(r.last_seen_at).getTime() > 10 * 60_000) {
    await sql(
      `UPDATE admin_sessions SET last_seen_at = now(),
         expires_at = LEAST(now() + $2::interval, created_at + $3::interval)
       WHERE id = $1`,
      [id, `${IDLE_DAYS} days`, `${MAX_DAYS} days`],
    ).catch(() => {});
  }
  return { id: r.id, email: r.email, name: r.name, totpEnabled: r.totp_enabled, sessionId: id };
});

/** For admin pages and their data: anyone without a valid session goes to the login screen. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const user = await getAdmin();
    await sql("DELETE FROM admin_sessions WHERE id = $1", [sha256(token)]);
    if (user) await audit("logout", user);
  }
  jar.set(COOKIE, "", cookieOpts(0));
}

// ---------------------------------------------------------------------------
// Sign-in

export type LoginResult =
  | { ok: true; mfa: false }
  | { ok: true; mfa: true }
  | { ok: false; error: string; status: number };

const GENERIC = "That email or password isn't right.";

/**
 * Every sign-in answer takes at least this long, whatever happened, so the
 * response time can't reveal whether an email has an account or which check failed.
 */
const MIN_LOGIN_MS = 900;

export async function login(emailIn: string, password: string): Promise<LoginResult> {
  const started = Date.now();
  const result = await loginInner(emailIn, password);
  const wait = MIN_LOGIN_MS - (Date.now() - started);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  return result;
}

async function loginInner(emailIn: string, password: string): Promise<LoginResult> {
  if (!authConfigured()) return { ok: false, status: 503, error: "Admin login isn't set up yet (ADMIN_SESSION_SECRET missing)." };
  await bootstrapUsers();
  const { ip } = await requestInfo();
  const email = emailIn.trim().toLowerCase().slice(0, 254);

  // Per network address: 20 tries per 15 minutes, across all accounts.
  if (!(await rateLimit(`login:ip:${ip}`, 20, 900))) {
    return { ok: false, status: 429, error: "Too many attempts from this network. Please wait 15 minutes and try again." };
  }

  const [u] = await sql<{ id: string; name: string; password_hash: string; totp_enabled: boolean; locked_until: Date | null; disabled: boolean; failed_logins: number }>(
    `SELECT id, name, password_hash, totp_enabled, locked_until, disabled, failed_logins FROM admin_users WHERE email = $1`,
    [email],
  );
  // Same work whether or not the account exists.
  const check = await verifyPassword(password, u?.password_hash ?? (await dummyHash()));

  if (u?.locked_until && new Date(u.locked_until).getTime() > Date.now()) {
    await audit("login.locked", { id: u.id, name: u.name }, email);
    return { ok: false, status: 429, error: "This account is temporarily locked after too many wrong passwords. Try again in 15 minutes." };
  }
  if (!u || u.disabled || !check.ok) {
    if (u) {
      // After LOCK_AFTER wrong passwords the account pauses for LOCK_MINUTES (then the count restarts).
      const failed = u.failed_logins + 1;
      const lock = failed >= LOCK_AFTER;
      await sql(
        `UPDATE admin_users SET failed_logins = $2, locked_until = CASE WHEN $3 THEN now() + $4::interval ELSE locked_until END WHERE id = $1`,
        [u.id, lock ? 0 : failed, lock, `${LOCK_MINUTES} minutes`],
      );
    }
    await audit("login.failed", u ? { id: u.id, name: u.name } : null, email);
    return { ok: false, status: 401, error: GENERIC };
  }

  // Transparent upgrade of older/weaker password hashes.
  if (check.rehash) await sql(`UPDATE admin_users SET password_hash = $2 WHERE id = $1`, [u.id, await hashPassword(password)]);
  await sql(`UPDATE admin_users SET failed_logins = 0, locked_until = NULL WHERE id = $1`, [u.id]);
  await clearRateLimit(`login:ip:${ip}`);

  if (u.totp_enabled) {
    (await cookies()).set(MFA_COOKIE, await createSession(u.id, true), cookieOpts(MFA_MINUTES * 60));
    return { ok: true, mfa: true };
  }
  await finishLogin(u.id, u.name, email);
  return { ok: true, mfa: false };
}

async function finishLogin(userId: string, name: string, email: string, viaRecovery = false) {
  // A fresh session id at every sign-in (no session fixation).
  await setSessionCookie(await createSession(userId, false));
  await sql(`UPDATE admin_users SET last_login_at = now() WHERE id = $1`, [userId]);
  // Housekeeping: expired sessions and stale rate-limit rows.
  await sql(`DELETE FROM admin_sessions WHERE expires_at < now()`).catch(() => {});
  await sql(`DELETE FROM rate_limits WHERE reset_at < now() - interval '1 day'`).catch(() => {});
  await audit(viaRecovery ? "login.recovery_code" : "login.success", { id: userId, name });
  await notifyNewSignIn(email, name).catch((e) => console.error("[auth] sign-in alert failed", (e as Error).message));
}

/** Second step: a 6-digit code from the authenticator app, or a recovery code. */
export async function verifyMfa(code: string): Promise<LoginResult> {
  const jar = await cookies();
  const token = jar.get(MFA_COOKIE)?.value;
  if (!token) return { ok: false, status: 401, error: "Your sign-in timed out. Please enter your password again." };
  const id = sha256(token);
  const [s] = await sql<{ user_id: string }>(`SELECT user_id FROM admin_sessions WHERE id = $1 AND mfa_pending AND expires_at > now()`, [id]);
  if (!s) return { ok: false, status: 401, error: "Your sign-in timed out. Please enter your password again." };

  // 6 tries per pending sign-in, then start over.
  if (!(await rateLimit(`mfa:${id}`, 6, MFA_MINUTES * 60))) {
    await sql(`DELETE FROM admin_sessions WHERE id = $1`, [id]);
    jar.set(MFA_COOKIE, "", cookieOpts(0));
    return { ok: false, status: 429, error: "Too many wrong codes. Please sign in again." };
  }

  type U = { id: string; name: string; email: string; totp_secret_enc: string | null; totp_last_step: string; recovery_codes: string[] };
  const outcome = await transaction(async (q) => {
    const [u] = await q<U>(
      `SELECT id, name, email, totp_secret_enc, totp_last_step, recovery_codes FROM admin_users WHERE id = $1 FOR UPDATE`,
      [s.user_id],
    );
    if (!u?.totp_secret_enc) return { u: u ?? null, ok: false, recovery: false };
    const step = checkTotp(decrypt(u.totp_secret_enc), code, Number(u.totp_last_step));
    if (step !== null) {
      // Remember the step so the same code can't be replayed.
      await q(`UPDATE admin_users SET totp_last_step = $2 WHERE id = $1`, [u.id, step]);
      return { u, ok: true, recovery: false };
    }
    const h = hashRecovery(code);
    if (u.recovery_codes.includes(h)) {
      // Each recovery code works once.
      await q(`UPDATE admin_users SET recovery_codes = array_remove(recovery_codes, $2) WHERE id = $1`, [u.id, h]);
      return { u, ok: true, recovery: true };
    }
    return { u, ok: false, recovery: false };
  });

  if (!outcome.ok || !outcome.u) {
    await audit("login.mfa_failed", outcome.u ? { id: outcome.u.id, name: outcome.u.name } : null);
    return { ok: false, status: 401, error: "That code isn't right. Check the time on your phone and try again." };
  }
  const result = { u: outcome.u, recovery: outcome.recovery };
  await sql(`DELETE FROM admin_sessions WHERE id = $1`, [id]);
  jar.set(MFA_COOKIE, "", cookieOpts(0));
  await finishLogin(result.u.id, result.u.name, result.u.email, result.recovery);
  return { ok: true, mfa: false };
}

// ---------------------------------------------------------------------------
// Account management helpers

export async function revokeOtherSessions(user: AdminUser) {
  await sql(`DELETE FROM admin_sessions WHERE user_id = $1 AND id <> $2`, [user.id, user.sessionId]);
}

export async function listSessions(user: AdminUser) {
  const rows = await sql<{ id: string; created_at: Date; last_seen_at: Date; ip: string; user_agent: string }>(
    `SELECT id, created_at, last_seen_at, ip, user_agent FROM admin_sessions
      WHERE user_id = $1 AND NOT mfa_pending AND expires_at > now() ORDER BY last_seen_at DESC`,
    [user.id],
  );
  // The public id is a hash of the stored hash, so the stored value never leaves the server.
  return rows.map((r) => ({
    id: sha256(r.id).slice(0, 24),
    current: r.id === user.sessionId,
    createdAt: new Date(r.created_at).toISOString(),
    lastSeenAt: new Date(r.last_seen_at).toISOString(),
    ip: r.ip,
    userAgent: r.user_agent,
  }));
}

export async function revokeSession(user: AdminUser, publicId: string) {
  const rows = await sql<{ id: string }>(`SELECT id FROM admin_sessions WHERE user_id = $1`, [user.id]);
  const match = rows.find((r) => sha256(r.id).slice(0, 24) === publicId && r.id !== user.sessionId);
  if (match) await sql(`DELETE FROM admin_sessions WHERE id = $1`, [match.id]);
  return Boolean(match);
}
