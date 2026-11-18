import { NextResponse, type NextRequest } from "next/server";
import { getBlogStats } from "@/lib/admin/analytics";
import { adminApi } from "@/lib/admin/http";

/** GET ?days=90&slug=my-post → numbers for one post (used in the editor). */
export async function GET(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const days = Math.min(400, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 30));
  const slug = req.nextUrl.searchParams.get("slug");
  const stats = await getBlogStats(days);
  if (slug) {
    const p = stats.posts.find((x) => x.slug === slug);
    return NextResponse.json({ post: p ?? { views: 0, reads: 0, half: 0, clicks: 0, shares: 0, bySite: {} } });
  }
  return NextResponse.json(stats);
}
