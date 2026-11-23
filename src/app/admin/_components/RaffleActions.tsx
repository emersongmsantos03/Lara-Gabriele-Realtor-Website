"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shuffle, Trophy, X } from "lucide-react";
import { alertDialog, confirmDialog } from "./DialogHost";

type Winner = { id: string; name: string; email: string; phone: string; area: string; pie: string };

export default function RaffleActions({
  open,
  total,
  winnersNeeded,
  winners,
}: {
  open: boolean;
  total: number;
  winnersNeeded: number;
  winners: Winner[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function post(body: object) {
    setBusy(true);
    const res = await fetch("/api/admin/raffle", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) await alertDialog({ title: "That didn't work", message: data.error || "Please try again.", tone: "danger" });
    router.refresh();
  }

  async function draw() {
    const count = winnersNeeded || 1;
    const ok = await confirmDialog({
      title: count === 1 ? "Draw 1 winner?" : `Draw ${count} winners?`,
      message: open
        ? "Entries are still open — people who enter after now won't be in this drawing."
        : `${count === 1 ? "One person is" : `${count} people are`} picked completely at random from everyone who hasn't won yet.`,
      confirmLabel: "Draw now",
      tone: open ? "warning" : "info",
      icon: "info",
    });
    if (ok) await post({ action: "draw", count });
  }

  async function unmark(w: Winner) {
    const ok = await confirmDialog({
      title: `Remove ${w.name} as a winner?`,
      message: "Use this if a winner doesn't respond. You can then draw a replacement.",
      confirmLabel: "Remove",
      tone: "danger",
      icon: "undo",
    });
    if (ok) await post({ action: "unmark", id: w.id });
  }

  const remaining = total - winners.length;

  return (
    <section className="a-card mt-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Trophy size={18} className="text-[var(--a-accent)]" /> Winners
          </h2>
          <p className="text-sm text-[var(--a-muted)] mt-0.5">
            {winners.length ? "Contact each winner and set up a time for their pie." : "Nobody has been drawn yet."}
          </p>
        </div>
        <button onClick={draw} disabled={busy || remaining === 0} className="a-btn a-btn-accent">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} />}
          {winnersNeeded ? `Draw ${winnersNeeded} winner${winnersNeeded === 1 ? "" : "s"}` : "Draw 1 more"}
        </button>
      </div>

      {winners.length > 0 && (
        <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {winners.map((w) => (
            <li key={w.id} className="relative rounded-xl border border-[#f3d6ad] bg-[#fff7ec] p-4">
              <button
                onClick={() => unmark(w)}
                disabled={busy}
                aria-label={`Remove ${w.name} as a winner`}
                className="absolute top-2.5 right-2.5 w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--a-muted)] hover:bg-white"
              >
                <X size={15} />
              </button>
              <p className="font-semibold pr-8">{w.name}</p>
              <p className="text-sm text-[var(--a-muted)]">
                {w.area} &middot; {w.pie}
              </p>
              <p className="mt-2 text-sm">
                <a href={`mailto:${w.email}?subject=${encodeURIComponent("You won a Christmas pie! 🥧")}`} className="underline underline-offset-2">
                  {w.email}
                </a>
              </p>
              {w.phone && (
                <p className="text-sm">
                  <a href={`tel:${w.phone.replace(/[^\d+]/g, "")}`} className="underline underline-offset-2">
                    {w.phone}
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
