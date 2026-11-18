import "server-only";

/**
 * What still has to be configured (in Vercel → Settings → Environment
 * Variables / Storage) before the admin can work. Names only, never values.
 */
export function missingSetup(): string[] {
  const env = process.env;
  const onVercel = env.VERCEL === "1";
  const missing: string[] = [];
  if (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) missing.push("ADMIN_SESSION_SECRET");
  if (onVercel && !env.DATABASE_URL && !env.POSTGRES_URL) missing.push("DATABASE_URL (Neon database)");
  if (onVercel && !env.BLOB_READ_WRITE_TOKEN) missing.push("BLOB_READ_WRITE_TOKEN (Vercel Blob, for photos)");
  return missing;
}
