import "server-only";
import { sql } from "./db";
import { isSaleSite, SALES_SHOWN, type Represented, type Sale, type SaleInput, type SaleSite } from "./sale-types";

export class SaleError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const COLS = `id, site, address, price, to_char(sold_on, 'YYYY-MM-DD') AS sold_on, beds, baths, sqft, photo, represented, note,
  updated_at, updated_by`;

type Row = {
  id: string;
  site: SaleSite;
  address: string;
  price: number;
  sold_on: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  photo: string;
  represented: Represented;
  note: string;
  updated_at: Date | string;
  updated_by: string;
};

const toSale = (r: Row): Sale => ({
  id: r.id,
  site: r.site,
  address: r.address,
  price: Number(r.price),
  soldOn: r.sold_on,
  beds: r.beds === null ? null : Number(r.beds),
  baths: r.baths === null ? null : Number(r.baths),
  sqft: r.sqft === null ? null : Number(r.sqft),
  photo: r.photo,
  represented: r.represented,
  note: r.note,
  updatedAt: new Date(r.updated_at).toISOString(),
  updatedBy: r.updated_by,
});

export async function allSales(): Promise<Sale[]> {
  return (await sql<Row>(`SELECT ${COLS} FROM sales ORDER BY sold_on DESC, created_at DESC`)).map(toSale);
}

/** What a website shows: newest first. */
export async function liveSales(site: SaleSite): Promise<Sale[]> {
  return (
    await sql<Row>(`SELECT ${COLS} FROM sales WHERE site = $1 ORDER BY sold_on DESC, created_at DESC LIMIT $2`, [site, SALES_SHOWN])
  ).map(toSale);
}

/** Public fields only (no editor names). */
export const toPublicSale = (s: Sale) => ({
  id: s.id,
  address: s.address,
  price: s.price,
  soldOn: s.soldOn,
  beds: s.beds,
  baths: s.baths,
  sqft: s.sqft,
  photo: s.photo,
  represented: s.represented,
  note: s.note,
});

function clean(input: SaleInput) {
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
  const optNum = (v: unknown, max: number, int = false) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n >= max) throw new SaleError("Please check the beds, baths and square feet.");
    return int ? Math.round(n) : Math.round(n * 2) / 2;
  };

  if (!isSaleSite(input.site)) throw new SaleError("Choose which website shows this sale.");
  const address = text(input.address, 160);
  if (!address) throw new SaleError("Add the address (or just the street name).");
  const price = Math.round(Number(input.price));
  if (!Number.isFinite(price) || price < 1000 || price > 2_000_000_000) throw new SaleError("Add the sold price.");
  const soldOn = typeof input.soldOn === "string" ? input.soldOn : "";
  const d = new Date(`${soldOn}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(soldOn) || Number.isNaN(d.getTime())) throw new SaleError("Add the date it sold.");
  if (d.getTime() > Date.now() + 2 * 86_400_000) throw new SaleError("The sold date can't be in the future.");
  const photo = text(input.photo, 1000);
  if (photo && !/^https?:\/\/[^\s"'<>()\\]+$/.test(photo)) throw new SaleError("That photo link doesn't look right. Upload the photo instead.");
  const represented = (["", "seller", "buyer", "both"] as const).includes(input.represented as Represented)
    ? (input.represented as Represented)
    : "";
  const sqft = optNum(input.sqft, 100_000, true);
  return {
    site: input.site,
    address,
    price,
    soldOn,
    beds: optNum(input.beds, 100),
    baths: optNum(input.baths, 100),
    sqft: sqft === 0 ? null : sqft,
    photo,
    represented,
    note: text(input.note, 160),
  };
}

export async function saveSale(id: string | null, input: SaleInput, by: string): Promise<Sale> {
  const s = clean(input);
  const vals = [s.site, s.address, s.price, s.soldOn, s.beds, s.baths, s.sqft, s.photo, s.represented, s.note, by];
  if (!id) {
    const [row] = await sql<Row>(
      `INSERT INTO sales (site, address, price, sold_on, beds, baths, sqft, photo, represented, note, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING ${COLS}`,
      vals,
    );
    return toSale(row);
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new SaleError("Sale not found.", 404);
  const [row] = await sql<Row>(
    `UPDATE sales SET site=$1, address=$2, price=$3, sold_on=$4, beds=$5, baths=$6, sqft=$7, photo=$8, represented=$9, note=$10,
       updated_by=$11, updated_at=now() WHERE id=$12 RETURNING ${COLS}`,
    [...vals, id],
  );
  if (!row) throw new SaleError("Sale not found.", 404);
  return toSale(row);
}

export async function deleteSale(id: string): Promise<Sale | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await sql<Row>(`DELETE FROM sales WHERE id = $1 RETURNING ${COLS}`, [id]);
  return row ? toSale(row) : null;
}
