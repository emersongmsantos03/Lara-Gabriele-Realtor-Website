import { NextResponse, type NextRequest } from "next/server";
import { adminApi, err, json, readJson } from "@/lib/admin/http";
import { deleteSale, SaleError, saveSale } from "@/lib/admin/sales";
import type { SaleInput } from "@/lib/admin/sale-types";
import { audit } from "@/lib/admin/security";

type Ctx = RouteContext<"/api/admin/sales/[id]">;

export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const body = await readJson<SaleInput>(req, 20_000);
  if (!body) return err("Couldn't read that sale.");
  try {
    const sale = await saveSale((await ctx.params).id, body, user.name);
    await audit("sale.updated", user, sale.address, { id: sale.id, site: sale.site });
    return json({ sale });
  } catch (e) {
    if (e instanceof SaleError) return err(e.message, e.status);
    console.error("[sales] update failed", (e as Error).message);
    return err("Couldn't save. Check your connection and try again.", 500);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const sale = await deleteSale((await ctx.params).id);
  if (!sale) return err("Sale not found.", 404);
  await audit("sale.deleted", user, sale.address, { id: sale.id, site: sale.site });
  return json({ ok: true });
}
