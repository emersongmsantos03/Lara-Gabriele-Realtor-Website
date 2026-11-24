import { NextResponse, type NextRequest } from "next/server";
import { adminApi, err, json, readJson } from "@/lib/admin/http";
import { allSales, SaleError, saveSale } from "@/lib/admin/sales";
import type { SaleInput } from "@/lib/admin/sale-types";
import { audit } from "@/lib/admin/security";

export async function GET(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  return json({ sales: await allSales() });
}

export async function POST(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const body = await readJson<SaleInput>(req, 20_000);
  if (!body) return err("Couldn't read that sale.");
  try {
    const sale = await saveSale(null, body, user.name);
    await audit("sale.created", user, sale.address, { id: sale.id, site: sale.site });
    return json({ sale });
  } catch (e) {
    if (e instanceof SaleError) return err(e.message, e.status);
    console.error("[sales] create failed", (e as Error).message);
    return err("Couldn't save. Check your connection and try again.", 500);
  }
}
