import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ExternalLink, PenSquare } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getStats, type Ranked, type SiteTotals } from "@/lib/admin/analytics";
import { allPosts } from "@/lib/admin/posts";
import { liveStatus } from "@/lib/admin/post-types";
import { isSiteId, SITE_IDS, SITE_LIST, SITES, type SiteId } from "@/lib/admin/sites";
import TrafficChart from "../_components/TrafficChart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const RANGES = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
];

const fmt = (n: number) => n.toLocaleString("en-US");

function greeting() {
  const h = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hourCycle: "h23" }).format(new Date()),
  );
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard(props: PageProps<"/admin">) {
  const sp = await props.searchParams;
  const range = RANGES.find((r) => r.id === sp.range) ?? RANGES[2];
  const siteParam = typeof sp.site === "string" ? sp.site : "all";
  const only: SiteId[] = isSiteId(siteParam) ? [siteParam] : [...SITE_IDS];

  const [user, stats, posts] = await Promise.all([
    requireAdmin(),
    getStats(range.days, only).catch((e) => {
      console.error(e);
      return null;
    }),
    allPosts().catch(() => []),
  ]);

  const href = (r: string, s: string) => `/admin?range=${r}${s === "all" ? "" : `&site=${s}`}`;
  const prevLabel = range.days === 1 ? "vs. yesterday" : `vs. previous ${range.days} days`;

  const counts = { draft: 0, scheduled: 0, published: 0 };
  for (const p of posts) counts[liveStatus(p)]++;
  const nextScheduled = posts
    .filter((p) => liveStatus(p) === "scheduled")
    .sort((a, b) => (a.publishAt || "").localeCompare(b.publishAt || ""))[0];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
            {greeting()}, {user?.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[var(--a-muted)]">Here&apos;s how your websites are doing.</p>
        </div>
        <Link href="/admin/posts/new" className="a-btn a-btn-accent">
          <PenSquare size={16} /> Write a post
        </Link>
      </header>

      {/* Filters: one row, above everything they scope. */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Segmented
          items={RANGES.map((r) => ({ label: r.label, href: href(r.id, siteParam), active: r.id === range.id }))}
        />
        <Segmented
          items={[
            { label: "All sites", href: href(range.id, "all"), active: siteParam === "all" },
            ...SITE_LIST.map((s) => ({
              label: s.short,
              href: href(range.id, s.id),
              active: siteParam === s.id,
              color: s.color,
            })),
          ]}
        />
      </div>

      {!stats ? (
        <div className="a-card mt-6 p-8 text-center text-[var(--a-muted)]">
          Couldn&apos;t load visitor numbers right now. Refresh the page in a moment.
        </div>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Kpi label="Visitors" value={stats.all.uv} prev={stats.all.prevUv} prevLabel={prevLabel} hint="Different people who visited" />
            <Kpi label="Page views" value={stats.all.pv} prev={stats.all.prevPv} prevLabel={prevLabel} hint="Pages opened in total" />
            <Kpi
              label="Leads"
              value={stats.all.leads}
              prev={stats.all.prevLeads}
              prevLabel={prevLabel}
              hint="Contact & home-value forms on pacificfriendlyrealty.com"
            />
            <div className="a-card p-4 sm:p-5">
              <p className="text-sm text-[var(--a-muted)]">On the sites now</p>
              <p className="mt-1 text-3xl sm:text-[34px] font-semibold tabular-nums flex items-center gap-2.5">
                {fmt(stats.all.live)}
                {stats.all.live > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#1baf7a] opacity-60 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1baf7a]" />
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-[var(--a-faint)]">Active in the last 5 minutes</p>
            </div>
          </section>

          <section className="a-card mt-4 p-4 sm:p-6">
            <TrafficChart
              series={stats.series}
              sites={stats.sites.map((id) => ({ id, name: SITES[id].short, color: SITES[id].color }))}
              hourly={stats.hourly}
            />
          </section>

          {only.length > 1 && (
            <section className="mt-4 grid md:grid-cols-3 gap-3 sm:gap-4">
              {SITE_LIST.map((s) => (
                <SiteCard key={s.id} site={s.id} t={stats.totals[s.id]} href={href(range.id, s.id)} />
              ))}
            </section>
          )}

          <section className="mt-4 grid lg:grid-cols-2 gap-3 sm:gap-4">
            <RankCard
              title="Most visited pages"
              empty="No visits yet in this period."
              items={stats.pages}
              render={(r) => (
                <a
                  href={`${SITES[r.site!].url}${r.name === "/" ? "" : r.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 min-w-0 hover:underline"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: SITES[r.site!].color }} />
                  <span className="truncate">
                    {only.length > 1 && <span className="text-[var(--a-faint)]">{SITES[r.site!].domain.replace(/\.com$/, "")}</span>}
                    {r.name === "/" ? (only.length > 1 ? " · Home" : "Home page") : `${only.length > 1 ? " · " : ""}${r.name}`}
                  </span>
                </a>
              )}
            />
            <RankCard title="Where visitors come from" empty="No visits yet in this period." items={stats.sources} />
            <RankCard title="Visitor locations" empty="No visits yet in this period." items={stats.places} />
            <RankCard title="Devices" empty="No visits yet in this period." items={stats.devices} />
          </section>
        </>
      )}

      <section className="a-card mt-4 p-5 sm:p-6 flex flex-wrap items-center gap-x-10 gap-y-4">
        <div>
          <h2 className="font-semibold">Blog</h2>
          <p className="text-sm text-[var(--a-muted)]">
            {nextScheduled
              ? `Next post goes live ${new Date(nextScheduled.publishAt!).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/Los_Angeles",
                })}`
              : "No posts scheduled."}
          </p>
        </div>
        {(
          [
            ["Published", counts.published, "published"],
            ["Scheduled", counts.scheduled, "scheduled"],
            ["Drafts", counts.draft, "draft"],
          ] as const
        ).map(([label, n, tab]) => (
          <Link key={label} href={`/admin/posts?tab=${tab}`} className="group">
            <span className="block text-2xl font-semibold tabular-nums">{n}</span>
            <span className="text-sm text-[var(--a-muted)] group-hover:underline">{label}</span>
          </Link>
        ))}
        <Link href="/admin/posts" className="a-btn a-btn-ghost ml-auto">
          Manage posts
        </Link>
      </section>
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

function Delta({ value, prev, label }: { value: number; prev: number; label: string }) {
  if (!prev) return <p className="mt-1 text-xs text-[var(--a-faint)]">Nothing to compare yet</p>;
  const pct = Math.round(((value - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <p className="mt-1 text-xs text-[var(--a-faint)] flex items-center gap-1">
      <span className={`inline-flex items-center font-semibold ${up ? "text-[var(--a-good)]" : "text-[var(--a-bad)]"}`}>
        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(pct)}%
      </span>
      {label}
    </p>
  );
}

function Kpi({ label, value, prev, prevLabel, hint }: { label: string; value: number; prev: number; prevLabel: string; hint: string }) {
  return (
    <div className="a-card p-4 sm:p-5" title={hint}>
      <p className="text-sm text-[var(--a-muted)]">{label}</p>
      <p className="mt-1 text-3xl sm:text-[34px] font-semibold tabular-nums">{fmt(value)}</p>
      <Delta value={value} prev={prev} label={prevLabel} />
    </div>
  );
}

function SiteCard({ site, t, href }: { site: SiteId; t: SiteTotals; href: string }) {
  const s = SITES[site];
  return (
    <div className="a-card p-5">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
        <Link href={href} scroll={false} className="font-semibold hover:underline truncate">
          {s.name}
        </Link>
        <a href={s.url} target="_blank" rel="noreferrer" className="ml-auto text-[var(--a-faint)] hover:text-[var(--a-text)]" aria-label={`Open ${s.domain}`}>
          <ExternalLink size={15} />
        </a>
      </div>
      <p className="text-xs text-[var(--a-faint)] mt-0.5">{s.domain}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <div>
          <dt className="text-xs text-[var(--a-muted)]">Visitors</dt>
          <dd className="text-xl font-semibold tabular-nums">{fmt(t.uv)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--a-muted)]">Views</dt>
          <dd className="text-xl font-semibold tabular-nums">{fmt(t.pv)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--a-muted)]">Now</dt>
          <dd className="text-xl font-semibold tabular-nums">{fmt(t.live)}</dd>
        </div>
      </dl>
    </div>
  );
}

function RankCard({
  title,
  items,
  empty,
  render,
}: {
  title: string;
  items: Ranked[];
  empty: string;
  render?: (r: Ranked) => React.ReactNode;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const total = items.reduce((t, i) => t + i.count, 0);
  return (
    <div className="a-card p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-6 mb-4 text-sm text-[var(--a-faint)]">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {items.map((r) => (
            <li
              key={`${r.site ?? ""}${r.name}`}
              className="relative flex items-center justify-between gap-4 rounded-md px-2.5 py-1.5 text-sm"
              title={`${r.name}: ${fmt(r.count)} (${Math.round((r.count / total) * 100)}%)`}
            >
              <span
                className="absolute inset-y-0 left-0 rounded-md bg-[#e3eefa]"
                style={{ width: `${(r.count / max) * 100}%` }}
                aria-hidden
              />
              <span className="relative min-w-0 truncate">{render ? render(r) : r.name}</span>
              <span className="relative tabular-nums font-medium">{fmt(r.count)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
