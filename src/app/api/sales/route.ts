import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_CORS, preflight } from "@/lib/admin/http";
import { liveSales, toPublicSale } from "@/lib/admin/sales";
import { isSaleSite } from "@/lib/admin/sale-types";

// Public "recently sold" feed used by SantaFeHillsSD.com and LomasVerdesEstates.com.
//   GET /api/sales?site=santafe → newest sales first
// Cached at the edge for a minute, so edits in the admin show up within ~1 minute.

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const site = req.nextUrl.searchParams.get("site");
  const headers = { ...PUBLIC_CORS, "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" };
  if (!isSaleSite(site)) return NextResponse.json({ error: "Unknown site." }, { status: 400, headers });
  try {
    return NextResponse.json({ sales: (await liveSales(site)).map(toPublicSale) }, { headers });
  } catch (e) {
    console.error("sales feed failed", e);
    return NextResponse.json({ sales: [] }, { status: 503, headers: PUBLIC_CORS });
  }
}
