import { ArrowDownRight, ArrowUpRight, Mail, Minus } from "lucide-react";
import {
  formatMonth,
  formatPrice,
  marketSource,
  type MarketSnapshot as Snapshot,
} from "@/lib/market";
import { site } from "@/lib/site";
import Reveal from "./Reveal";

function YoY({ value, month }: { value: number; month: string }) {
  const [y, m] = month.split("-");
  const lastYear = formatMonth(`${Number(y) - 1}-${m}`);
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const sign = value > 0 ? "+" : "";
  return (
    <span className="mt-3 flex items-center gap-1 font-body text-xs text-ink-soft">
      <Icon size={14} className="text-gold" aria-hidden />
      <span>
        <span className="font-medium text-ink">
          {sign}
          {value.toFixed(1)}%
        </span>{" "}
        vs. {lastYear}
      </span>
    </span>
  );
}

export default function MarketSnapshot({
  area,
  data,
}: {
  area: string;
  data: Snapshot & { sample: boolean };
}) {
  const monthLabel = formatMonth(data.month);
  const tiles = [
    {
      label: "Median sale price",
      value: formatPrice(data.medianPrice),
      extra: <YoY value={data.medianPriceYoY} month={data.month} />,
    },
    { label: "Median days on market", value: String(data.daysOnMarket) },
    { label: "Sale-to-list price", value: `${data.saleToList.toFixed(1)}%` },
    { label: "Active listings", value: String(data.activeListings) },
  ];

  return (
    <section id="market" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {data.sample && (
          <p className="mb-8 rounded-xl border border-dashed border-clay/60 bg-clay/5 px-4 py-3 text-sm text-clay">
            Sample numbers — visible in development only. Add real figures for
            this area in <code>src/lib/market.ts</code> to publish this section.
          </p>
        )}

        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-gold text-xs md:text-sm tracking-[0.25em] uppercase mb-4">
                Market update &middot; {monthLabel}
              </p>
              <h2 className="font-display text-3xl md:text-5xl leading-tight text-balance max-w-2xl">
                The {area} market, right now.
              </h2>
            </div>
            <a
              href={site.newsletterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-cream transition-colors"
            >
              <Mail size={15} />
              Get this report every month
            </a>
          </div>
        </Reveal>

        <dl className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-2xl overflow-hidden border border-line">
          {tiles.map((t, i) => (
            <Reveal key={t.label} delay={i * 80} className="h-full bg-cream p-5 sm:p-8">
              <dt className="text-[11px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] uppercase text-ink-soft">{t.label}</dt>
              <dd className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl tabular-nums">
                {t.value}
                {t.extra}
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={120}>
          <figure className="mt-10 grid md:grid-cols-12 gap-6 items-start">
            <figcaption className="md:col-span-3 text-xs tracking-[0.2em] uppercase text-gold pt-1">
              Lara&rsquo;s take
            </figcaption>
            <blockquote className="md:col-span-9 font-display text-xl md:text-2xl leading-snug text-ink">
              &ldquo;{data.note}&rdquo;
            </blockquote>
          </figure>
        </Reveal>

        <p className="mt-10 text-xs text-ink-soft/70 max-w-3xl">
          Source: {marketSource}, {monthLabel}. Figures are for the area as a
          whole and individual homes vary. Information deemed reliable but not
          guaranteed.
        </p>
      </div>
    </section>
  );
}
