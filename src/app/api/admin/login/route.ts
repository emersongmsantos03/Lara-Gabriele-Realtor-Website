import { type NextRequest } from "next/server";
import { login } from "@/lib/admin/auth";
import { err, json, readJson, sameOrigin } from "@/lib/admin/http";

/** Step 1: email + password. Answers { ok, mfa } — mfa:true means "ask for the 6-digit code". */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return err("Request blocked.", 403);
  const body = await readJson<{ email?: unknown; password?: unknown }>(req, 10_000);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  if (!email || !password) return err("Enter your email and password.");
  try {
    const r = await login(email, password);
    return r.ok ? json({ ok: true, mfa: r.mfa }) : err(r.error, r.status);
  } catch (e) {
    console.error("[login]", (e as Error).message);
    return err("Sign-in is temporarily unavailable. Please try again in a minute.", 503);
  }
}
