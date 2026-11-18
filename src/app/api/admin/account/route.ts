import { NextResponse, type NextRequest } from "next/server";
import { listSessions, revokeOtherSessions, revokeSession } from "@/lib/admin/auth";
import {
  AccountError,
  accountOverview,
  changePassword,
  confirmTotpSetup,
  disableTotp,
  regenerateRecoveryCodes,
  startTotpSetup,
} from "@/lib/admin/account";
import { adminApi, err, json, readJson } from "@/lib/admin/http";
import { audit } from "@/lib/admin/security";

/** GET: account overview + signed-in devices. */
export async function GET(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  return json({ account: await accountOverview(user), sessions: await listSessions(user) });
}

/** POST { action, ... }: one endpoint for every account change. */
export async function POST(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const b = await readJson<Record<string, unknown>>(req, 10_000);
  const s = (k: string) => (typeof b?.[k] === "string" ? (b[k] as string).slice(0, 200) : "");
  try {
    switch (b?.action) {
      case "password":
        await changePassword(user, s("current"), s("next"));
        return json({ ok: true });
      case "totp-start":
        return json(await startTotpSetup(user));
      case "totp-confirm":
        return json({ recoveryCodes: await confirmTotpSetup(user, s("code")) });
      case "totp-disable":
        await disableTotp(user, s("password"));
        return json({ ok: true });
      case "recovery-codes":
        return json({ recoveryCodes: await regenerateRecoveryCodes(user, s("password")) });
      case "revoke-session":
        if (!(await revokeSession(user, s("id")))) return err("That device is already signed out.", 404);
        await audit("sessions.revoked", user, "one device");
        return json({ ok: true });
      case "revoke-others":
        await revokeOtherSessions(user);
        await audit("sessions.revoked", user, "all other devices");
        return json({ ok: true });
      default:
        return err("Unknown action.");
    }
  } catch (e) {
    if (e instanceof AccountError) return err(e.message, e.status);
    console.error("[account]", (e as Error).message);
    return err("Something went wrong. Please try again.", 500);
  }
}
