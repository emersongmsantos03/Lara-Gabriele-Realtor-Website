import { listSessions, requireAdmin } from "@/lib/admin/auth";
import { accountOverview, securityActivity } from "@/lib/admin/account";
import AccountClient from "../../_components/AccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Security" };

export default async function AccountPage() {
  const user = await requireAdmin();
  const [account, sessions, activity] = await Promise.all([accountOverview(user), listSessions(user), securityActivity(40)]);
  return <AccountClient account={account} sessions={sessions} activity={activity} />;
}
