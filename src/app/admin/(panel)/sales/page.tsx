import { requireAdmin } from "@/lib/admin/auth";
import { allSales } from "@/lib/admin/sales";
import SalesManager from "../../_components/SalesManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recent sales" };

export default async function SalesPage() {
  await requireAdmin();
  return <SalesManager initialSales={await allSales()} />;
}
