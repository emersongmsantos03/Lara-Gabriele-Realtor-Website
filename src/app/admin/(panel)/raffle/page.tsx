import { Download, ExternalLink, Mail, Trophy, Users } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listEntries } from "@/lib/admin/raffle";
import { TZ } from "@/lib/admin/time";
import { raffle, raffleOpen } from "@/lib/raffle";
import RaffleActions from "../../_components/RaffleActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pie raffle" };

export default async function RafflePage() {
  await requireAdmin();
  const entries = await listEntries(raffle.id).catch(() => null);
  const winners = entries?.filter((e) => e.winnerAt) ?? [];
  const optedIn = entries?.filter((e) => e.marketingOk).length ?? 0;
  const open = raffleOpen();

  const pies = new Map<string, number>();
  for (const e of entries ?? []) pies.set(e.pie, (pies.get(e.pie) ?? 0) + 1);

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">Christmas pie raffle</h1>
          <p className="mt-1 text-[var(--a-muted)]">
            {open ? `Open — entries close ${raffle.closesLabel} at midnight.` : "Entries are closed."} Draw {raffle.winners} winners on{" "}
            {raffle.drawLabel}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={raffle.path} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost">
            <ExternalLink size={16} /> View page
          </a>
          <a href="/api/admin/raffle" className="a-btn a-btn-ghost">
            <Download size={16} /> Download CSV
          </a>
        </div>
      </header>

      {!entries ? (
        <div className="a-card mt-6 p-8 text-center text-[var(--a-muted)]">Couldn&apos;t load entries right now.</div>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Tile icon={Users} label="Entries" value={entries.length} />
            <Tile icon={Mail} label="Want market updates" value={optedIn} />
            <Tile icon={Trophy} label="Winners drawn" value={`${winners.length} / ${raffle.winners}`} />
            <div className="a-card p-4 sm:p-5">
              <p className="text-sm text-[var(--a-muted)]">Pie picks</p>
              <ul className="mt-2 space-y-0.5 text-sm">
                {[...pies.entries()].sort((a, b) => b[1] - a[1]).map(([pie, n]) => (
                  <li key={pie} className="flex justify-between gap-2">
                    <span>{pie}</span>
                    <b>{n}</b>
                  </li>
                ))}
                {!pies.size && <li className="text-[var(--a-faint)]">None yet</li>}
              </ul>
            </div>
          </section>

          <RaffleActions
            open={open}
            total={entries.length}
            winnersNeeded={Math.max(0, raffle.winners - winners.length)}
            winners={winners.map((w) => ({ id: w.id, name: w.name, email: w.email, phone: w.phone, area: w.area, pie: w.pie }))}
          />

          <section className="a-card mt-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--a-line)] font-semibold">All entries</div>
            {entries.length === 0 ? (
              <p className="p-8 text-center text-[var(--a-muted)]">No entries yet. Share the page link to get things started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[var(--a-muted)] bg-[var(--a-bg)]">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Name</th>
                      <th className="px-5 py-2.5 font-medium">Contact</th>
                      <th className="px-5 py-2.5 font-medium">Area</th>
                      <th className="px-5 py-2.5 font-medium">Pie</th>
                      <th className="px-5 py-2.5 font-medium">Updates</th>
                      <th className="px-5 py-2.5 font-medium">Entered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className={`border-t border-[var(--a-line)] ${e.winnerAt ? "bg-[#fff7ec]" : ""}`}>
                        <td className="px-5 py-3 font-medium whitespace-nowrap">
                          {e.winnerAt && <Trophy size={14} className="inline -mt-0.5 mr-1.5 text-[var(--a-accent)]" />}
                          {e.name}
                        </td>
                        <td className="px-5 py-3">
                          <a href={`mailto:${e.email}`} className="hover:underline">{e.email}</a>
                          {e.phone && <div className="text-[var(--a-muted)]">{e.phone}</div>}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">{e.area}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{e.pie}</td>
                        <td className="px-5 py-3">{e.marketingOk ? "Yes" : "–"}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-[var(--a-muted)]">{when(e.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function Tile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className="a-card p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm text-[var(--a-muted)]">
        <Icon size={16} /> {label}
      </p>
      <p className="mt-2 text-[28px] font-semibold tracking-tight">{value}</p>
    </div>
  );
}
