import { NextResponse, type NextRequest } from "next/server";
import { adminApi } from "@/lib/admin/http";
import { exportAll } from "@/lib/admin/posts";
import { allSales } from "@/lib/admin/sales";
import { audit, rateLimit } from "@/lib/admin/security";

/** Downloads every post and its history as one JSON file (your own backup copy). */
export async function GET(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  if (!(await rateLimit(`export:${user.id}`, 10, 3600))) return NextResponse.json({ error: "Too many downloads. Try again later." }, { status: 429 });
  const data = { ...(await exportAll()), sales: await allSales() };
  await audit("data.exported", user, null, { posts: data.posts.length });
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="pacific-friendly-blog-backup-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
