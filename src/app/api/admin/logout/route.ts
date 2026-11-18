import { NextResponse, type NextRequest } from "next/server";
import { logout } from "@/lib/admin/auth";
import { sameOrigin } from "@/lib/admin/http";

export async function POST(req: NextRequest) {
  // Only our own "Log out" button may sign someone out.
  if (sameOrigin(req)) await logout().catch((e) => console.error("[logout]", (e as Error).message));
  return NextResponse.redirect(new URL("/admin/login", req.url), 303);
}
