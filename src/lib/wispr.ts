// Wispr Properties — Lara's private, off-market inventory.
//
// Dormant until WISPR_API_URL and WISPR_API_KEY are set: the homepage section
// shows the explanation and a locked preview, and no request is made. Once
// both are set, up to three teaser cards (area, price range, beds/baths — never
// the address) replace the preview. The key stays server-side.
//
// When the real API docs arrive, adjust `endpoint()` and `toListing()` to its
// shape; nothing else should need to change.

export type WisprListing = {
  id: string;
  area: string;
  priceLabel: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  photo?: string;
  status?: string;
};

export type WisprInventory = { listings: WisprListing[]; total: number };

const API_URL = process.env.WISPR_API_URL?.replace(/\/$/, "");
const API_KEY = process.env.WISPR_API_KEY;
const EMPTY: WisprInventory = { listings: [], total: 0 };

export const wisprEnabled = Boolean(API_URL && API_KEY);

function endpoint(limit: number) {
  return `${API_URL}/listings?status=active&limit=${limit}`;
}

type Raw = Record<string, unknown>;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

// Off-market sellers expect discretion: show a rounded range, not the number.
function priceRange(price?: number) {
  if (!price) return "Price on request";
  const step = price >= 2_000_000 ? 250_000 : 100_000;
  const low = Math.floor(price / step) * step;
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 2 : 1).replace(/\.?0+$/, "")}M` : `$${n / 1000}K`;
  return `${fmt(low)}–${fmt(low + step)}`;
}

function toListing(raw: Raw): WisprListing | null {
  const id = str(raw.id) ?? (num(raw.id) !== undefined ? String(raw.id) : undefined);
  const area = str(raw.neighborhood) ?? str(raw.area) ?? str(raw.city);
  if (!id || !area) return null;
  const photos = Array.isArray(raw.photos) ? raw.photos : [];
  return {
    id,
    area,
    priceLabel: str(raw.priceRange) ?? priceRange(num(raw.price)),
    beds: num(raw.beds) ?? num(raw.bedrooms),
    baths: num(raw.baths) ?? num(raw.bathrooms),
    sqft: num(raw.sqft) ?? num(raw.livingArea),
    photo: str(raw.photo) ?? str(raw.coverPhoto) ?? str(photos[0]),
    status: str(raw.status),
  };
}

export async function getWisprInventory(limit = 3): Promise<WisprInventory> {
  if (!wisprEnabled) return EMPTY;
  try {
    const res = await fetch(endpoint(limit), {
      headers: { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" },
      next: { revalidate: 900, tags: ["wispr-listings"] },
    });
    if (!res.ok) throw new Error(`Wispr API responded ${res.status}`);
    const body = (await res.json()) as Raw | Raw[];
    const rows = Array.isArray(body)
      ? body
      : ((body.listings ?? body.data ?? body.results ?? []) as Raw[]);
    const listings = rows.map(toListing).filter((l): l is WisprListing => l !== null);
    const total = Array.isArray(body) ? listings.length : (num(body.total) ?? listings.length);
    return { listings: listings.slice(0, limit), total };
  } catch (err) {
    // Never break the homepage over the feed — fall back to the locked preview.
    console.error("Wispr inventory unavailable:", err);
    return EMPTY;
  }
}
