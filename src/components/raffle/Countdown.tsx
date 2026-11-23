"use client";

import { useEffect, useState } from "react";
import { raffle } from "@/lib/raffle";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

// Rendered only after mount, so server HTML and the visitor's clock never disagree.
export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const end = new Date(raffle.closesAt).getTime();
  const left = now === null ? null : end - now;

  if (left !== null && left <= 0) {
    return <p className="text-sm text-cream/80">Entries are closed. Winners are drawn {raffle.drawLabel}.</p>;
  }

  const p = left === null ? null : parts(left);
  const cells: [string, number | undefined][] = [
    ["days", p?.days],
    ["hrs", p?.hours],
    ["min", p?.minutes],
    ["sec", p?.seconds],
  ];

  return (
    <div aria-label="Time left to enter" className="flex items-end gap-2 sm:gap-3">
      {cells.map(([label, v]) => (
        <div key={label} className="w-[62px] sm:w-[70px] rounded-2xl bg-cream/[0.07] ring-1 ring-cream/15 backdrop-blur-sm py-2.5 text-center">
          <div className="font-display text-2xl sm:text-3xl tabular-nums leading-none text-cream" suppressHydrationWarning>
            {v === undefined ? "–" : String(v).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cream/55">{label}</div>
        </div>
      ))}
    </div>
  );
}
