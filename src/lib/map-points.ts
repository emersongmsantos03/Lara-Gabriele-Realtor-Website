import { areas, type Region } from "./areas";
import { formatMonth, formatPrice, marketReports } from "./market";

// The slice of each area the client-side map needs, so the full guide text
// isn't shipped to the browser.
export type MapPoint = {
  slug: string;
  name: string;
  region: Region;
  tagline: string;
  blurb: string;
  coords: [number, number];
  /** e.g. "$2.45M median · August 2026", when a market report exists. */
  price?: string;
};

export function getMapPoints(): MapPoint[] {
  return areas.map((a) => {
    const m = marketReports[a.slug];
    return {
      slug: a.slug,
      name: a.name,
      region: a.region,
      tagline: a.tagline,
      blurb: a.blurb,
      coords: a.coords,
      price: m ? `${formatPrice(m.medianPrice)} median · ${formatMonth(m.month)}` : undefined,
    };
  });
}
