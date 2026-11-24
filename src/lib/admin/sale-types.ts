// Recent sales shown on the neighborhood sites. Safe to import from client code.

export const SALE_SITES = ["santafe", "lomasverdes"] as const;
export type SaleSite = (typeof SALE_SITES)[number];

export type Represented = "" | "seller" | "buyer" | "both";

export const REPRESENTED_LABEL: Record<Represented, string> = {
  "": "Neighborhood sale (not Lara's)",
  seller: "Lara represented the seller",
  buyer: "Lara represented the buyer",
  both: "Lara represented both sides",
};

export type Sale = {
  id: string;
  site: SaleSite;
  address: string;
  price: number;
  /** YYYY-MM-DD */
  soldOn: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  photo: string;
  represented: Represented;
  note: string;
  updatedAt: string;
  updatedBy: string;
};

export type SaleInput = Partial<Omit<Sale, "id" | "updatedAt" | "updatedBy">>;

/** How many sales each website shows. */
export const SALES_SHOWN = 12;

export const isSaleSite = (v: unknown): v is SaleSite => typeof v === "string" && (SALE_SITES as readonly string[]).includes(v);
