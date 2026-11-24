import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { headers } from "next/headers";
import { sql } from "./db";

// Security building blocks for the admin.

const scrypt = promisify(scryptCb) as (pw: string | Buffer, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

// ---------------------------------------------------------------------------
// Passwords: scrypt with OWASP's recommended cost (N=2^17, r=8, p=1).
// Stored as scrypt$<log2N>$<r>$<p>$<salt b64>$<hash b64> so the cost can be
// raised later; older hashes are upgraded automatically at the next login.

const COST = { logN: 17, r: 8, p: 1 };

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, 64, { N: 2 ** COST.logN, r: COST.r, p: COST.p, maxmem: 256 * 1024 * 1024 });
  return `scrypt$${COST.logN}$${COST.r}$${COST.p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

/** Returns whether the password matches and whether the stored hash should be upgraded. */
export async function verifyPassword(password: string, stored: string): Promise<{ ok: boolean; rehash: boolean }> {
  let logN: number, r: number, p: number, salt: Buffer, expected: Buffer;
  const parts = stored.split("$");
  if (parts[0] === "scrypt" && parts.length === 6) {
    [logN, r, p] = parts.slice(1, 4).map(Number);
    salt = Buffer.from(parts[4], "base64");
    expected = Buffer.from(parts[5], "base64");
  } else if (parts.length === 2) {
    // Legacy format from the ADMIN_USERS env var: saltHex$hashHex (Node defaults N=2^14).
    [logN, r, p] = [14, 8, 1];
    salt = Buffer.from(parts[0], "hex");
    expected = Buffer.from(parts[1], "hex");
  } else {
    return { ok: false, rehash: false };
  }
  const got = await scrypt(password.normalize("NFKC"), salt, expected.length, { N: 2 ** logN, r, p, maxmem: 256 * 1024 * 1024 });
  const ok = got.length === expected.length && timingSafeEqual(got, expected);
  // Legacy hashes were made without NFKC normalisation; try the raw string too.
  if (!ok && parts.length === 2) {
    const raw = await scrypt(password, salt, expected.length, { N: 2 ** logN, r, p, maxmem: 64 * 1024 * 1024 });
    if (timingSafeEqual(raw, expected)) return { ok: true, rehash: true };
  }
  return { ok, rehash: ok && (logN < COST.logN || r !== COST.r || p !== COST.p) };
}

/** A real hash to compare against when the email doesn't exist, so timing doesn't reveal accounts. */
let dummy: Promise<string> | null = null;
export function dummyHash() {
  return (dummy ??= hashPassword(randomBytes(16).toString("hex")));
}

const COMMON = ["password", "123456", "qwerty", "letmein", "welcome", "admin", "realtor", "pacific", "friendly", "iloveyou", "sandiego"];

/** NIST 800-63B style: length over complexity, block known-bad passwords. */
export async function passwordProblem(pw: string, ctx: { email: string; name: string }): Promise<string | null> {
  if (pw.length < 12) return "Use at least 12 characters. A short sentence works great.";
  if (pw.length > 200) return "That password is too long.";
  const lower = pw.toLowerCase();
  if (new Set(pw).size < 6) return "That password repeats the same characters too much.";
  const local = ctx.email.split("@")[0].toLowerCase();
  if ((local.length >= 4 && lower.includes(local)) || (ctx.name.length >= 4 && lower.includes(ctx.name.toLowerCase().split(" ")[0])))
    return "Don't use your name or email in the password.";
  if (COMMON.some((c) => lower.replace(/[^a-z]/g, "") === c || lower.startsWith(c + "1"))) return "That password is too common.";
  if (await isBreached(pw)) return "That password has appeared in a data breach. Please choose a different one.";
  return null;
}

/**
 * Have I Been Pwned "k-anonymity" check: only the first 5 characters of the
 * password's SHA-1 leave the server, never the password. Fails open.
 */
async function isBreached(pw: string) {
  const h = createHash("sha1").update(pw).digest("hex").toUpperCase();
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${h.slice(0, 5)}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const text = await res.text();
    return text.split("\n").some((line) => {
      const [suffix, count] = line.trim().split(":");
      return suffix === h.slice(5) && Number(count) > 0;
    });
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tokens & encryption

export const newToken = () => randomBytes(32).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

function masterSecret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET must be set (32+ characters).");
  return s;
}
/** Separate keys per purpose, derived from the one secret (HKDF-SHA256). */
function subkey(purpose: string) {
  return Buffer.from(hkdfSync("sha256", masterSecret(), "pfr-admin", purpose, 32));
}

/** AES-256-GCM for secrets stored in the database (2-step verification keys). */
export function encrypt(plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", subkey("totp-v1"), iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return `v1.${iv.toString("base64url")}.${data.toString("base64url")}.${c.getAuthTag().toString("base64url")}`;
}
export function decrypt(blob: string) {
  const [v, iv, data, tag] = blob.split(".");
  if (v !== "v1") throw new Error("Unknown encryption version");
  const d = createDecipheriv("aes-256-gcm", subkey("totp-v1"), Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
}

// ---------------------------------------------------------------------------
// 2-step verification (TOTP, RFC 6238): works with Google Authenticator,
// Microsoft Authenticator, 1Password, Authy…

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function base32(buf: Buffer) {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}
function unbase32(s: string) {
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of s.replace(/=+$/, "").toUpperCase()) {
    const i = B32.indexOf(ch);
    if (i < 0) continue;
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}
function hotp(key: Buffer, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", key).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}
export const newTotpSecret = () => base32(randomBytes(20));

/** Returns the matched time step (to block replays), or null. Allows ±30 s clock drift. */
export function checkTotp(secretB32: string, code: string, lastStep: number): number | null {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return null;
  const key = unbase32(secretB32);
  const now = Math.floor(Date.now() / 30_000);
  for (const step of [now - 1, now, now + 1]) {
    if (step <= lastStep) continue;
    if (timingSafeEqual(Buffer.from(hotp(key, step)), Buffer.from(clean))) return step;
  }
  return null;
}

export function totpUri(secret: string, email: string) {
  const label = encodeURIComponent(`Pacific Friendly Admin:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent("Pacific Friendly Admin")}&algorithm=SHA1&digits=6&period=30`;
}

/** 10 one-time recovery codes like "k7m2-9qxp". Only their hashes are stored. */
export function newRecoveryCodes() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => {
    const b = randomBytes(8);
    const s = Array.from(b, (x) => alphabet[x % alphabet.length]).join("");
    return `${s.slice(0, 4)}-${s.slice(4)}`;
  });
}
export const hashRecovery = (code: string) => sha256(`recovery:${code.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}`);

// ---------------------------------------------------------------------------
// Request context

export async function requestInfo() {
  const h = await headers();
  return {
    ip: h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "local",
    ua: (h.get("user-agent") || "").slice(0, 300),
    city: [h.get("x-vercel-ip-city"), h.get("x-vercel-ip-country-region"), h.get("x-vercel-ip-country")]
      .filter(Boolean)
      .map((v) => decodeURIComponent(v!))
      .join(", "),
  };
}

// ---------------------------------------------------------------------------
// Rate limiting (fixed window, stored in Postgres so it holds across servers)

/** Counts a hit; returns false when the limit for this window is exceeded. */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const [row] = await sql<{ count: number }>(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES ($1, 1, now() + make_interval(secs => $2))
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at < now() THEN now() + make_interval(secs => $2) ELSE rate_limits.reset_at END
     RETURNING count`,
    [key, windowSec],
  );
  return Number(row.count) <= limit;
}
export const clearRateLimit = (key: string) => sql("DELETE FROM rate_limits WHERE key = $1", [key]);

/** Cheap in-memory limiter for high-volume public endpoints (per server instance). */
const buckets = new Map<string, { n: number; reset: number }>();
export function memoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    if (buckets.size > 20_000) buckets.clear();
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  return ++b.n <= limit;
}

// ---------------------------------------------------------------------------
// Audit log

export type AuditAction =
  | "login.success" | "login.failed" | "login.locked" | "login.mfa_failed" | "login.recovery_code" | "logout"
  | "password.changed" | "mfa.enabled" | "mfa.disabled" | "mfa.recovery_regenerated" | "sessions.revoked"
  | "post.created" | "post.updated" | "post.published" | "post.scheduled" | "post.unpublished"
  | "post.trashed" | "post.restored" | "post.deleted" | "image.uploaded" | "data.exported"
  | "sale.created" | "sale.updated" | "sale.deleted";

export async function audit(
  action: AuditAction,
  who: { id?: string | null; name?: string | null } | null,
  target?: string | null,
  meta?: Record<string, unknown>,
) {
  try {
    const { ip, ua } = await requestInfo();
    await sql(`INSERT INTO audit_log (user_id, actor, action, target, ip, user_agent, meta) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
      who?.id ?? null,
      who?.name ?? null,
      action,
      target ?? null,
      ip,
      ua,
      meta ? JSON.stringify(meta) : null,
    ]);
  } catch (e) {
    console.error("[audit] failed", (e as Error).message);
  }
}
