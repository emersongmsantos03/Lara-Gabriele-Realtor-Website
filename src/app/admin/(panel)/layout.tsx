import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { dbMissing } from "@/lib/admin/db";
import SideNav from "../_components/SideNav";

// Note: every page below also checks the session itself — layouts don't
// re-run on client-side navigation, so they must not be the only guard.
export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <SideNav name={user.name} />
      <div className="flex-1 min-w-0">
        {dbMissing && (
          <div className="bg-[#fff4e5] border-b border-[#f3d6ad] text-[#7a4a10] text-sm px-6 py-3">
            <b>Database not connected.</b> In Vercel, open this project → Storage → add a <b>Neon Postgres</b> database, then redeploy.
          </div>
        )}
        {!user.totpEnabled && (
          <div className="bg-[#eef4fd] border-b border-[#cfe0f6] text-[#1f4f8f] text-sm px-6 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <ShieldAlert size={16} className="shrink-0" />
            <span>Protect your account: turn on 2-step verification (takes 1 minute with your phone).</span>
            <Link href="/admin/account" className="font-semibold underline underline-offset-2">
              Turn it on
            </Link>
          </div>
        )}
        <main className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10 py-6 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
