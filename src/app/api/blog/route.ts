import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_CORS, preflight } from "@/lib/admin/http";
import { livePosts, livePostBySlug, toSummary } from "@/lib/admin/posts";
import { isSiteId, SITES } from "@/lib/admin/sites";

// Public blog feed used by SantaFeHillsSD.com and LomasVerdesEstates.com.
//   GET /api/blog?site=santafe              → list of live posts
//   GET /api/blog?site=santafe&slug=my-post → one full post
// Cached at the edge for a minute, so scheduled posts appear within ~1 minute.

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const site = req.nextUrl.searchParams.get("site");
  const slug = req.nextUrl.searchParams.get("slug");
  const headers = { ...PUBLIC_CORS, "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" };
  if (!isSiteId(site)) return NextResponse.json({ error: "Unknown site." }, { status: 400, headers });

  try {
    if (slug) {
      const post = await livePostBySlug(site, slug);
      if (!post) return NextResponse.json({ error: "Not found." }, { status: 404, headers });
      // One canonical URL when a post runs on several sites (the main site wins).
      const home = post.sites.includes("pacific") ? "pacific" : post.sites[0];
      return NextResponse.json(
        { post: { ...toSummary(post), contentHtml: post.contentHtml, canonical: SITES[home].postUrl(post.slug) } },
        { headers },
      );
    }
    const posts = (await livePosts(site)).map(toSummary);
    return NextResponse.json({ posts }, { headers });
  } catch (e) {
    console.error("blog feed failed", e);
    return NextResponse.json({ posts: [] }, { status: 503, headers: PUBLIC_CORS });
  }
}
