import Link from "next/link";
import { BookOpen, BookOpenCheck, Eye, ImageIcon, MousePointerClick, Share2 } from "lucide-react";
import { getBlogStats } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/admin/auth";
import { allPosts } from "@/lib/admin/posts";
import { isSiteId, SITE_IDS, SITE_LIST, SITES, type SiteId } from "@/lib/admin/sites";
import TrafficChart from "../../_components/TrafficChart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog stats" };

const RANGES = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "1y", label: "1 year", days: 365 },
];
const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");
const prettySlug = (s: string) => s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export default async function BlogStatsPage(props: PageProps<"/admin/blog-stats">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const range = RANGES.find((r) => r.id === sp.range) ?? RANGES[1];
  const siteParam = typeof sp.site === "string" ? sp.site : "all";
  const only: SiteId[] = isSiteId(siteParam) ? [siteParam] : [...SITE_IDS];
  const [stats, posts] = await Promise.all([getBlogStats(range.days, only).catch(() => null), allPosts().catch(() => [])]);
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const href = (r: string, s: string) => `/admin/blog-stats?range=${r}${s === "all" ? "" : `&site=${s}`}`;

  return (
    <div>
      <header>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">Blog stats</h1>
        <p className="mt-1 text-[var(--a-muted)]">Which posts people read, how far they get, and what they click.</p>
      </header>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Segmented items={RANGES.map((r) => ({ label: r.label, href: href(r.id, siteParam), active: r.id === range.id }))} />
        <Segmented
          items={[
            { label: "All sites", href: href(range.id, "all"), active: siteParam === "all" },
            ...SITE_LIST.map((s) => ({ label: s.short, href: href(range.id, s.id), active: siteParam === s.id, color: s.color })),
          ]}
        />
      </div>

      {!stats ? (
        <div className="a-card mt-6 p-8 text-center text-[var(--a-muted)]">Couldn&apos;t load blog numbers right now.</div>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Tile icon={Eye} label="Post views" value={fmt(stats.totals.views)} hint="Times a post was opened" />
            <Tile icon={BookOpen} label="Read halfway" value={fmt(stats.totals.half)} hint={`${pct(stats.totals.half, stats.totals.views)} of views`} />
            <Tile icon={BookOpenCheck} label="Read to the end" value={fmt(stats.totals.reads)} hint={`${pct(stats.totals.reads, stats.totals.views)} of views`} />
            <Tile icon={MousePointerClick} label="Button & link clicks" value={fmt(stats.totals.clicks)} hint="Inside your posts" />
            <Tile icon={Share2} label="Shares" value={fmt(stats.totals.shares)} hint="Facebook, email, copy link…" />
          </section>

          <section className="a-card mt-4 p-4 sm:p-6">
            <TrafficChart
              title="Post views per day"
              hourly={false}
              series={stats.series}
              sites={only.map((id) => ({ id, name: SITES[id].short, color: SITES[id].color }))}
            />
          </section>

          <section className="a-card mt-4 overflow-hidden">
            <div className="p-5 sm:p-6 pb-3">
              <h2 className="font-semibold">Posts</h2>
              <p className="text-sm text-[var(--a-muted)]">Sorted by views in this period.</p>
            </div>
            {stats.posts.length === 0 ? (
              <p className="px-6 pb-8 text-sm text-[var(--a-faint)]">No post views in this period yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="text-[var(--a-muted)] text-xs uppercase tracking-wide">
                    <tr className="border-y border-[var(--a-line)] bg-[var(--a-bg)]">
                      <th className="text-left font-medium px-5 py-2.5">Post</th>
                      <th className="text-right font-medium px-3 py-2.5">Views</th>
                      <th className="text-right font-medium px-3 py-2.5" title="Of the people who opened it">Read to end</th>
                      <th className="text-right font-medium px-3 py-2.5">Clicks</th>
                      <th className="text-right font-medium px-5 py-2.5">Shares</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.posts.map((row) => {
                      const p = bySlug.get(row.slug);
                      return (
                        <tr key={row.slug} className="border-b border-[var(--a-line)] last:border-0">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="h-10 w-14 shrink-0 rounded-md overflow-hidden bg-[var(--a-hover)] flex items-center justify-center">
                                {p?.coverImage ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <ImageIcon size={16} className="text-[var(--a-faint)]" />
                                )}
                              </span>
                              <span className="min-w-0">
                                {p ? (
                                  <Link href={`/admin/posts/${p.id}`} className="font-medium hover:underline line-clamp-1">{p.title}</Link>
                                ) : (
                                  <span className="font-medium line-clamp-1">{prettySlug(row.slug)}</span>
                                )}
                                <span className="flex flex-wrap gap-x-3 text-xs text-[var(--a-muted)]">
                                  {(Object.entries(row.bySite) as [SiteId, number][]).map(([id, n]) => (
                                    <span key={id} className="inline-flex items-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: SITES[id].color }} /> {SITES[id].short} {fmt(n)}
                                    </span>
                                  ))}
                                  {!p && <span className="italic">starter article</span>}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums font-semibold">{fmt(row.views)}</td>
                          <td className="px-3 py-3 text-right">
                            <ReadBar reads={row.reads} views={row.views} />
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">{fmt(row.clicks)}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{fmt(row.shares)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="a-card mt-4 p-5 sm:p-6">
            <h2 className="font-semibold">What readers clicked</h2>
            <p className="text-sm text-[var(--a-muted)]">Buttons, links and share buttons inside your posts.</p>
            {stats.clicks.length === 0 ? (
              <p className="mt-5 text-sm text-[var(--a-faint)]">No clicks yet in this period.</p>
            ) : (
              <ul className="mt-4 divide-y divide-[var(--a-line)]">
                {stats.clicks.map((c) => (
                  <li key={`${c.kind}${c.slug}${c.label}`} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        {c.kind === "share" ? <Share2 size={14} className="text-[var(--a-muted)]" /> : <MousePointerClick size={14} className="text-[var(--a-muted)]" />}
                        {c.kind === "share" ? (c.label === "Copy link" ? "Copied the link to share" : `Shared on ${c.label}`) : c.label}
                      </span>
                      <span className="block text-xs text-[var(--a-muted)] truncate">in “{bySlug.get(c.slug)?.title ?? prettySlug(c.slug)}”</span>
                    </span>
                    <span className="tabular-nums font-semibold">{fmt(c.count)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ReadBar({ reads, views }: { reads: number; views: number }) {
  const r = views ? Math.min(1, reads / views) : 0;
  return (
    <span className="inline-flex items-center gap-2 justify-end" title={`${reads} of ${views} views read to the end`}>
      <span className="h-1.5 w-16 rounded-full bg-[var(--a-hover)] overflow-hidden">
        <span className="block h-full bg-[#1baf7a]" style={{ width: `${r * 100}%` }} />
      </span>
      <span className="tabular-nums w-9 text-right">{views ? `${Math.round(r * 100)}%` : "–"}</span>
    </span>
  );
}

function Tile({ icon: Icon, label, value, hint }: { icon: typeof Eye; label: string; value: string; hint: string }) {
  return (
    <div className="a-card p-4 sm:p-5">
      <p className="text-sm text-[var(--a-muted)] flex items-center gap-1.5">
        <Icon size={15} /> {label}
      </p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-[var(--a-faint)]">{hint}</p>
    </div>
  );
}

function Segmented({ items }: { items: { label: string; href: string; active: boolean; color?: string }[] }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-white border border-[var(--a-line)] p-1">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          scroll={false}
          aria-current={i.active ? "page" : undefined}
          className={`flex items-center gap-2 rounded-lg px-3 h-8 text-sm font-medium transition-colors ${
            i.active ? "bg-[var(--a-navy)] text-white" : "text-[var(--a-muted)] hover:text-[var(--a-text)] hover:bg-[var(--a-hover)]"
          }`}
        >
          {i.color && <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />}
          {i.label}
        </Link>
      ))}
    </div>
  );
}
