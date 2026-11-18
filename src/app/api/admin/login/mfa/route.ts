import { type NextRequest } from "next/server";
import { verifyMfa } from "@/lib/admin/auth";
import { err, json, readJson, sameOrigin } from "@/lib/admin/http";

/** Step 2: the 6-digit code from the authenticator app, or a recovery code. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return err("Request blocked.", 403);
  const body = await readJson<{ code?: unknown }>(req, 2_000);
  const code = typeof body?.code === "string" ? body.code.slice(0, 20) : "";
  if (!code) return err("Enter the code from your authenticator app.");
  try {
    const r = await verifyMfa(code);
    return r.ok ? json({ ok: true }) : err(r.error, r.status);
  } catch (e) {
    console.error("[mfa]", (e as Error).message);
    return err("Sign-in is temporarily unavailable. Please try again in a minute.", 503);
  }
}
