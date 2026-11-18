import { NextResponse, type NextRequest } from "next/server";
import { adminApi, json } from "@/lib/admin/http";
import { revisions } from "@/lib/admin/posts";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/posts/[id]/revisions">) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  return json({ revisions: await revisions((await ctx.params).id) });
}
