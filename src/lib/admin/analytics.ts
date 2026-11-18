import "server-only";
import { createHash } from "crypto";
import { sql } from "./db";
import { SITE_IDS, SITES, type SiteId } from "./sites";

// Cookie-free visit counting for all three sites, stored as daily aggregates
// in Postgres (table stat_daily). Privacy by design:
// - No IP address or user agent is ever stored.
// - A visitor is a hash of IP + browser + a random salt that changes every day
//   and is deleted after 2 days, so yesterday's visitors can't be re-identified.
// - The per-day hashes themselves are deleted after 2 days; only counts remain.

const TZ = "America/Los_Angeles";
const LIVE_MINUTES = 5;

export function dayKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
function hourOf(d: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(d).padStart(2, "0");
}

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless|pingdom|uptime|monitor|facebookexternalhit|curl|wget|python|axios|node-fetch|vercel-screenshot|scrapy|httpclient|go-http|java\//i;

export function isBot(ua: string) {
  return !ua || ua.length < 20 || BOT.test(ua);
}

function device(ua: string) {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "Tablet";
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return "Mobile";
  return "Desktop";
}

const SEARCH: Record<string, string> = {
  google: "Google", bing: "Bing", duckduckgo: "DuckDuckGo", yahoo: "Yahoo", ecosia: "Ecosia",
  facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", "t.co": "X / Twitter",
  twitter: "X / Twitter", youtube: "YouTube", pinterest: "Pinterest", nextdoor: "Nextdoor",
  chatgpt: "ChatGPT", perplexity: "Perplexity", zillow: "Zillow", redfin: "Redfin", realtor: "Realtor.com",
};

/** Printable, bounded label (stats are shown in the admin). */
const label = (s: string, max: number) => s.replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);

function source(referrer: string, url: URL | null, siteHost: string) {
  const utm = url?.searchParams.get("utm_source");
  if (utm) return label(utm.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()), 60) || "Direct";
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === siteHost || host.endsWith(`.${siteHost}`) || host === "localhost") return null; // internal click
    for (const [k, v] of Object.entries(SEARCH)) if (host.includes(k)) return v;
    for (const s of Object.values(SITES)) if (host === s.domain) return s.name;
    return label(host, 80);
  } catch {
    return "Direct";
  }
}

function cleanPath(url: URL | null) {
  if (!url) return "/";
  let p = url.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  // Static sites render CMS posts at /blog/post.html?slug=...
  const slug = url.searchParams.get("slug");
  if (/\/blog\/post$/.test(p) && slug && /^[a-z0-9-]{1,100}$/.test(slug)) p = `/blog/${slug}`;
  if (p.length > 1) p = p.replace(/\/$/, "");
  try {
    p = decodeURIComponent(p);
  } catch {}
  return label(p, 200) || "/";
}

// Daily random salt, cached per server instance.
const saltCache = new Map<string, string>();
async function saltFor(day: string) {
  const hit = saltCache.get(day);
  if (hit) return hit;
  const [row] = await sql<{ salt: string }>(
    `WITH ins AS (INSERT INTO stat_salts (day, salt) VALUES ($1, gen_random_uuid()::text || gen_random_uuid()::text) ON CONFLICT (day) DO NOTHING RETURNING salt)
     SELECT salt FROM ins UNION ALL SELECT salt FROM stat_salts WHERE day = $1 LIMIT 1`,
    [day],
  );
  if (saltCache.size > 5) saltCache.clear();
  saltCache.set(day, row.salt);
  return row.salt;
}

/** Adds 1 to several counters for one site/day in a single round trip. */
async function bump(site: SiteId, day: string, pairs: [string, string][]) {
  await sql(
    `INSERT INTO stat_daily (site, day, metric, key, count)
     SELECT $1, $2::date, m, k, 1 FROM unnest($3::text[], $4::text[]) AS t(m, k)
     ON CONFLICT (site, day, metric, key) DO UPDATE SET count = stat_daily.count + 1`,
    [site, day, pairs.map((p) => p[0]), pairs.map((p) => p[1])],
  );
}

export type Hit = { site: SiteId; url: string; referrer: string; ua: string; ip: string; city?: string; region?: string; country?: string };

export async function recordHit(h: Hit) {
  const now = new Date();
  const day = dayKey(now);
  let url: URL | null = null;
  try {
    url = new URL(h.url);
  } catch {}
  const salt = await saltFor(day);
  const visitor = createHash("sha256").update(`${salt}|${h.site}|${h.ip}|${h.ua}`).digest("base64url").slice(0, 22);

  const place =
    h.city || h.region || h.country
      ? label(h.country === "US" || !h.country ? [h.city, h.region].filter(Boolean).join(", ") : [h.city, h.country].filter(Boolean).join(", "), 80)
      : "Unknown";
  const src = source(h.referrer, url, SITES[h.site].domain);
  const pairs: [string, string][] = [
    ["pv", ""],
    ["page", cleanPath(url)],
    ["dev", device(h.ua)],
    ["hour", hourOf(now)],
  ];
  // Location and source are counted once per visit (the first page), not per page.
  if (src !== null) pairs.push(["ref", src], ["geo", place || "Unknown"]);

  // One statement: new visitor today? → +1 unique; mark "on the site now"; bump counters.
  await sql(
    `WITH v AS (
       INSERT INTO stat_visitors (site, day, visitor) VALUES ($1, $2::date, $3) ON CONFLICT DO NOTHING RETURNING 1
     ), l AS (
       INSERT INTO stat_live (site, visitor, seen_at) VALUES ($1, $3, now())
       ON CONFLICT (site, visitor) DO UPDATE SET seen_at = excluded.seen_at
     )
     INSERT INTO stat_daily (site, day, metric, key, count)
     SELECT $1, $2::date, m, k, 1 FROM unnest($4::text[], $5::text[]) AS t(m, k)
     UNION ALL SELECT $1, $2::date, 'uv', '', 1 FROM v
     ON CONFLICT (site, day, metric, key) DO UPDATE SET count = stat_daily.count + 1`,
    [h.site, day, visitor, pairs.map((p) => p[0]), pairs.map((p) => p[1])],
  );
}

export async function recordLead(site: SiteId) {
  await bump(site, dayKey(new Date()), [["leads", ""]]);
}

/** Old visitor hashes, salts and "live" rows (privacy + keeps tables small). */
export async function purgeAnalytics() {
  await sql(`DELETE FROM stat_visitors WHERE day < current_date - 2`);
  await sql(`DELETE FROM stat_salts WHERE day < current_date - 2`);
  await sql(`DELETE FROM stat_live WHERE seen_at < now() - interval '1 hour'`);
  // Counts older than ~2 years aren't shown anywhere.
  await sql(`DELETE FROM stat_daily WHERE day < current_date - 800`);
}

// ---------------------------------------------------------------------------
// Blog engagement events (sent by the post pages on all three sites)

export const BLOG_EVENTS = ["read50", "read100", "click", "share"] as const;
export type BlogEvent = (typeof BLOG_EVENTS)[number];

export async function recordBlogEvent(site: SiteId, slug: string, event: BlogEvent, text = "") {
  const s = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 100);
  if (!s) return;
  const pairs: [string, string][] = [["ev", `${event}|${s}`]];
  const l = label(text.replace(/\|/g, "/"), 80);
  if ((event === "click" || event === "share") && l) pairs.push(["clk", `${event}|${s}|${l}`]);
  await bump(site, dayKey(new Date()), pairs);
}

// ---------------------------------------------------------------------------
// Dashboard queries

export type Ranked = { name: string; count: number; site?: SiteId };
export type SiteTotals = { pv: number; uv: number; leads: number; prevPv: number; prevUv: number; prevLeads: number; live: number };
export type Stats = {
  days: number;
  sites: SiteId[];
  series: { label: string; key: string; values: Record<SiteId, { pv: number; uv: number }> }[];
  hourly: boolean;
  totals: Record<SiteId, SiteTotals>;
  all: SiteTotals;
  pages: Ranked[];
  sources: Ranked[];
  places: Ranked[];
  devices: Ranked[];
};

function daysBack(n: number, offset = 0) {
  const out: string[] = [];
  const now = Date.now();
  for (let i = n - 1 + offset; i >= offset; i--) out.push(dayKey(new Date(now - i * 86400000)));
  return [...new Set(out)];
}
const num = (v: unknown) => Number(v ?? 0) || 0;
const zeroRow = () => Object.fromEntries(SITE_IDS.map((s) => [s, { pv: 0, uv: 0 }])) as Record<SiteId, { pv: number; uv: number }>;
const dayLabel = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export async function getStats(days: number, only: SiteId[] = [...SITE_IDS]): Promise<Stats> {
  const range = daysBack(days);
  const prev = daysBack(days, days);
  const hourly = days === 1;
  const sites = only.length ? only : [...SITE_IDS];
  const [from, to, pFrom, pTo] = [range[0], range[range.length - 1], prev[0], prev[prev.length - 1]];

  const [totalsRows, seriesRows, liveRows, topRows, pageRows] = await Promise.all([
    sql<{ site: SiteId; metric: string; cur: string; prev: string }>(
      `SELECT site, metric,
              sum(count) FILTER (WHERE day BETWEEN $1 AND $2) AS cur,
              sum(count) FILTER (WHERE day BETWEEN $3 AND $4) AS prev
         FROM stat_daily WHERE day BETWEEN $3 AND $2 AND metric IN ('pv','uv','leads') GROUP BY site, metric`,
      [from, to, pFrom, pTo],
    ),
    hourly
      ? sql<{ site: SiteId; key: string; n: string }>(`SELECT site, key, sum(count) AS n FROM stat_daily WHERE day = $1 AND metric = 'hour' GROUP BY site, key`, [from])
      : sql<{ site: SiteId; day: string; metric: string; n: string }>(
          `SELECT site, to_char(day, 'YYYY-MM-DD') AS day, metric, sum(count) AS n FROM stat_daily
            WHERE day BETWEEN $1 AND $2 AND metric IN ('pv','uv') GROUP BY site, day, metric`,
          [from, to],
        ),
    sql<{ site: SiteId; n: string }>(`SELECT site, count(*) AS n FROM stat_live WHERE seen_at > now() - make_interval(mins => $1) GROUP BY site`, [LIVE_MINUTES]),
    sql<{ metric: string; key: string; n: string }>(
      `SELECT metric, key, n FROM (
         SELECT metric, key, sum(count) AS n, row_number() OVER (PARTITION BY metric ORDER BY sum(count) DESC, key) AS rn
           FROM stat_daily WHERE day BETWEEN $1 AND $2 AND site = ANY($3) AND metric IN ('ref','geo','dev')
          GROUP BY metric, key) t WHERE rn <= 10`,
      [from, to, sites],
    ),
    sql<{ site: SiteId; key: string; n: string }>(
      `SELECT site, key, sum(count) AS n FROM stat_daily WHERE day BETWEEN $1 AND $2 AND site = ANY($3) AND metric = 'page'
        GROUP BY site, key ORDER BY n DESC, key LIMIT 12`,
      [from, to, sites],
    ),
  ]);

  const totals = Object.fromEntries(
    SITE_IDS.map((s) => [s, { pv: 0, uv: 0, leads: 0, prevPv: 0, prevUv: 0, prevLeads: 0, live: 0 }]),
  ) as Record<SiteId, SiteTotals>;
  for (const r of totalsRows) {
    const t = totals[r.site];
    if (!t) continue;
    if (r.metric === "pv") [t.pv, t.prevPv] = [num(r.cur), num(r.prev)];
    if (r.metric === "uv") [t.uv, t.prevUv] = [num(r.cur), num(r.prev)];
    if (r.metric === "leads") [t.leads, t.prevLeads] = [num(r.cur), num(r.prev)];
  }
  for (const r of liveRows) if (totals[r.site]) totals[r.site].live = num(r.n);
  const all = sites.reduce(
    (t, s) => {
      for (const k of Object.keys(t) as (keyof SiteTotals)[]) t[k] += totals[s][k];
      return t;
    },
    { pv: 0, uv: 0, leads: 0, prevPv: 0, prevUv: 0, prevLeads: 0, live: 0 },
  );

  let series: Stats["series"];
  if (hourly) {
    const nowHour = Number(hourOf(new Date()));
    series = Array.from({ length: nowHour + 1 }, (_, h) => ({ key: String(h).padStart(2, "0"), label: `${h % 12 || 12}${h < 12 ? "am" : "pm"}`, values: zeroRow() }));
    for (const r of seriesRows as { site: SiteId; key: string; n: string }[]) {
      const point = series[Number(r.key)];
      if (point && point.values[r.site]) point.values[r.site].pv = num(r.n);
    }
  } else {
    const byDay = new Map(range.map((d) => [d, zeroRow()]));
    for (const r of seriesRows as { site: SiteId; day: string; metric: "pv" | "uv"; n: string }[]) {
      const row = byDay.get(r.day);
      if (row?.[r.site]) row[r.site][r.metric] = num(r.n);
    }
    series = range.map((d) => ({ key: d, label: dayLabel(d), values: byDay.get(d)! }));
  }

  const pick = (metric: string) => topRows.filter((r) => r.metric === metric).map((r) => ({ name: r.key, count: num(r.n) }));
  return {
    days,
    sites,
    series,
    hourly,
    totals,
    all,
    pages: pageRows.map((r) => ({ name: r.key, count: num(r.n), site: r.site })),
    sources: pick("ref"),
    places: pick("geo"),
    devices: pick("dev").slice(0, 3),
  };
}

export type PostTotals = { views: number; reads: number; half: number; clicks: number; shares: number; bySite: Partial<Record<SiteId, number>> };

/** All-time numbers for every post. */
export async function allTimePostTotals(): Promise<Record<string, PostTotals>> {
  const rows = await sql<{ site: SiteId; metric: string; key: string; n: string }>(
    `SELECT site, metric, key, sum(count) AS n FROM stat_daily
      WHERE (metric = 'page' AND key LIKE '/blog/%') OR metric = 'ev' GROUP BY site, metric, key`,
  );
  return foldPostRows(rows);
}

function foldPostRows(rows: { site: SiteId; metric: string; key: string; n: string }[]) {
  const out: Record<string, PostTotals & { slug: string }> = {};
  const get = (slug: string) => (out[slug] ??= { slug, views: 0, reads: 0, half: 0, clicks: 0, shares: 0, bySite: {} });
  for (const r of rows) {
    const n = num(r.n);
    if (r.metric === "page") {
      const slug = r.key.match(/^\/blog\/([a-z0-9-]+)$/)?.[1];
      if (!slug) continue;
      const p = get(slug);
      p.views += n;
      p.bySite[r.site] = (p.bySite[r.site] ?? 0) + n;
    } else if (r.metric === "ev") {
      const [ev, slug] = r.key.split("|");
      if (!slug) continue;
      const p = get(slug);
      if (ev === "read100") p.reads += n;
      else if (ev === "read50") p.half += n;
      else if (ev === "click") p.clicks += n;
      else if (ev === "share") p.shares += n;
    }
  }
  return out;
}

export type BlogStats = {
  days: number;
  totals: { views: number; reads: number; half: number; clicks: number; shares: number };
  posts: (PostTotals & { slug: string })[];
  clicks: { slug: string; kind: "click" | "share"; label: string; count: number }[];
  series: { label: string; key: string; values: Record<SiteId, { pv: number; uv: number }> }[];
};

/** Blog numbers for a date range. */
export async function getBlogStats(days: number, only: SiteId[] = [...SITE_IDS]): Promise<BlogStats> {
  const range = daysBack(days);
  const [from, to] = [range[0], range[range.length - 1]];
  const [postRows, dayRows, clickRows] = await Promise.all([
    sql<{ site: SiteId; metric: string; key: string; n: string }>(
      `SELECT site, metric, key, sum(count) AS n FROM stat_daily
        WHERE day BETWEEN $1 AND $2 AND site = ANY($3) AND ((metric = 'page' AND key LIKE '/blog/%') OR metric = 'ev')
        GROUP BY site, metric, key`,
      [from, to, only],
    ),
    sql<{ site: SiteId; day: string; n: string }>(
      `SELECT site, to_char(day, 'YYYY-MM-DD') AS day, sum(count) AS n FROM stat_daily
        WHERE day BETWEEN $1 AND $2 AND site = ANY($3) AND metric = 'page' AND key ~ '^/blog/[a-z0-9-]+$'
        GROUP BY site, day`,
      [from, to, only],
    ),
    sql<{ key: string; n: string }>(
      `SELECT key, sum(count) AS n FROM stat_daily WHERE day BETWEEN $1 AND $2 AND site = ANY($3) AND metric = 'clk'
        GROUP BY key ORDER BY n DESC LIMIT 15`,
      [from, to, only],
    ),
  ]);
  const posts = Object.values(foldPostRows(postRows)).sort((a, b) => b.views - a.views) as (PostTotals & { slug: string })[];
  const byDay = new Map(range.map((d) => [d, zeroRow()]));
  for (const r of dayRows) {
    const row = byDay.get(r.day);
    if (row?.[r.site]) row[r.site].pv += num(r.n);
  }
  const totals = posts.reduce(
    (t, p) => ({ views: t.views + p.views, reads: t.reads + p.reads, half: t.half + p.half, clicks: t.clicks + p.clicks, shares: t.shares + p.shares }),
    { views: 0, reads: 0, half: 0, clicks: 0, shares: 0 },
  );
  return {
    days,
    totals,
    posts,
    clicks: clickRows.map((r) => {
      const [ev, slug, ...rest] = r.key.split("|");
      return { slug, kind: ev === "share" ? ("share" as const) : ("click" as const), label: rest.join("|"), count: num(r.n) };
    }),
    series: range.map((d) => ({ key: d, label: dayLabel(d), values: byDay.get(d)! })),
  };
}
