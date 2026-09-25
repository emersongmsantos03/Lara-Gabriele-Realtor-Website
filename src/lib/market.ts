// Monthly market snapshots, one per neighborhood slug. Update these once a
// month from the MLS (e.g. Sandicor / SDAR monthly stats) — an area only shows
// its "Market update" section once it has real numbers here.
//
// Example entry:
//
//   "la-jolla": {
//     month: "2026-08",
//     medianPrice: 2_450_000,
//     medianPriceYoY: 3.8,
//     daysOnMarket: 24,
//     saleToList: 97.9,
//     activeListings: 112,
//     note: "Inventory is up a little from spring, so well-priced homes still move fast but buyers have room to negotiate on anything that needs work.",
//   },

export type MarketSnapshot = {
  /** Month the figures cover, as "YYYY-MM". */
  month: string;
  /** Median closed sale price in USD. */
  medianPrice: number;
  /** Year-over-year change in median price, in percent (e.g. 3.8 or -2.1). */
  medianPriceYoY: number;
  /** Median days on market for closed sales. */
  daysOnMarket: number;
  /** Median sale price as a percent of final list price (e.g. 98.5). */
  saleToList: number;
  /** Active listings at the end of the month. */
  activeListings: number;
  /** Lara's one- or two-sentence read on the month. */
  note: string;
};

export const marketSource = "San Diego MLS (Sandicor), single-family homes and condos";

export const marketReports: Record<string, MarketSnapshot> = {};

// Shown only under `next dev` so the section can be previewed before real
// numbers are in. Never rendered in a production build.
const devSample: MarketSnapshot = {
  month: "2026-08",
  medianPrice: 1_285_000,
  medianPriceYoY: 2.4,
  daysOnMarket: 21,
  saleToList: 98.6,
  activeListings: 64,
  note: "Sample note: this is where Lara's short take on the month goes — what buyers and sellers should know right now.",
};

export function getMarketSnapshot(
  slug: string
): (MarketSnapshot & { sample: boolean }) | undefined {
  const real = marketReports[slug];
  if (real) return { ...real, sample: false };
  if (process.env.NODE_ENV === "development") return { ...devSample, sample: true };
  return undefined;
}

export function formatMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  return `$${Math.round(n / 1000)}K`;
}
