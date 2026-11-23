"use client";

import { useEffect, useState } from "react";
import { raffle } from "@/lib/raffle";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

// Rendered only after mount, so server HTML and the visitor's clock never disagree.
export default function Countdown({ label }: { label?: string }) {
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
    return (
      <p className="text-base text-cream/85">
        It&rsquo;s drawing time — winners will hear from me soon. Good luck!
      </p>
    );
  }

  const p = left === null ? null : parts(left);
  const cells: [string, number | undefined][] = [
    ["days", p?.days],
    ["hrs", p?.hours],
    ["min", p?.minutes],
    ["sec", p?.seconds],
  ];

  return (
    <div>
      {label && (
        <p className="text-xs uppercase tracking-[0.22em] text-cream/55 mb-3">
          {label}
        </p>
      )}
      <div
        aria-label="Time left until the drawing"
        className="flex items-end gap-2 sm:gap-3"
      >
        {cells.map(([unit, v]) => (
          <div
            key={unit}
            className="w-[62px] sm:w-[70px] rounded-2xl bg-cream/[0.07] ring-1 ring-cream/15 backdrop-blur-sm py-2.5 text-center"
          >
            <div
              className="font-display text-2xl sm:text-3xl tabular-nums leading-none text-cream"
              suppressHydrationWarning
            >
              {v === undefined ? "–" : String(v).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cream/55">
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
