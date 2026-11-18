import { after, NextResponse, type NextRequest } from "next/server";
import { BLOG_EVENTS, isBot, purgeAnalytics, recordBlogEvent, recordHit, type BlogEvent } from "@/lib/admin/analytics";
import { COOKIE, getAdmin } from "@/lib/admin/auth";
import { PUBLIC_CORS, preflight } from "@/lib/admin/http";
import { purgeOldTrash } from "@/lib/admin/posts";
import { memoryLimit } from "@/lib/admin/security";
import { isSiteId, SITES } from "@/lib/admin/sites";

// Page-view and blog-event beacon for all three sites. Sent with
// navigator.sendBeacon as text/plain (no CORS preflight). The response goes
// out immediately; the database write happens right after, via after().

export function OPTIONS() {
  return preflight();
}

const ok = () => new NextResponse(null, { status: 204, headers: PUBLIC_CORS });
const decode = (v: string | null) => {
  if (!v) return undefined;
  try {
    return decodeURIComponent(v).slice(0, 60);
  } catch {
    return undefined;
  }
};

export async function POST(req: NextRequest) {
  if (Number(req.headers.get("content-length") || 0) > 4096) return ok();
  const text = await req.text().catch(() => "");
  if (!text || text.length > 4096) return ok();
  let body: { s?: unknown; u?: unknown; r?: unknown; e?: unknown; p?: unknown; l?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return ok();
  }
  const site = body.s;
  const url = typeof body.u === "string" ? body.u.slice(0, 500) : "";
  if (!isSiteId(site) || !url) return ok();

  // Only count visits to the real domains (not previews or copies of the snippet).
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return ok();
  }
  const dev = process.env.NODE_ENV !== "production" && (host === "localhost" || host === "127.0.0.1");
  if (host !== SITES[site].domain && !dev) return ok();

  const h = req.headers;
  const ua = (h.get("user-agent") ?? "").slice(0, 400);
  if (isBot(ua)) return ok();
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "0.0.0.0";
  // A real visitor sends a few dozen of these per visit; this stops flooding.
  if (!memoryLimit(`track:${ip}`, 120, 10 * 60_000)) return ok();
  // Don't count admins looking at the main site.
  if (site === "pacific" && req.cookies.get(COOKIE) && (await getAdmin())) return ok();

  const event = typeof body.e === "string" ? body.e : null;
  const hit = {
    site,
    url,
    referrer: typeof body.r === "string" ? body.r.slice(0, 500) : "",
    ua,
    ip,
    city: decode(h.get("x-vercel-ip-city")),
    region: decode(h.get("x-vercel-ip-country-region")),
    country: decode(h.get("x-vercel-ip-country")),
  };

  after(async () => {
    try {
      if (event) {
        if ((BLOG_EVENTS as readonly string[]).includes(event) && typeof body.p === "string") {
          await recordBlogEvent(site, body.p, event as BlogEvent, typeof body.l === "string" ? body.l : "");
        }
      } else {
        await recordHit(hit);
      }
      // Occasional housekeeping (privacy retention + old trash), ~1 in 500 hits.
      if (Math.random() < 0.002) {
        await purgeAnalytics();
        await purgeOldTrash();
      }
    } catch (e) {
      console.error("[track] failed", (e as Error).message);
    }
  });
  return ok();
}
