"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteId } from "@/lib/admin/sites";

type Point = { label: string; key: string; values: Record<SiteId, { pv: number; uv: number }> };
type Site = { id: SiteId; name: string; color: string };

const H = 260;
const PAD = { top: 12, right: 12, bottom: 28, left: 40 };

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * 4 >= v) ?? pow * 10;
  return step * 4;
}

export default function TrafficChart({
  series,
  sites,
  hourly,
  title: fixedTitle,
}: {
  series: Point[];
  sites: Site[];
  hourly: boolean;
  /** When set, the chart shows page views only, under this title. */
  title?: string;
}) {
  const [metric, setMetric] = useState<"uv" | "pv">(hourly || fixedTitle ? "pv" : "uv");
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(800);
  const box = useRef<HTMLDivElement>(null);
  const m = hourly || fixedTitle ? "pv" : metric;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(200, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = useMemo(
    () => niceMax(Math.max(0, ...series.flatMap((p) => sites.map((s) => p.values[s.id][m])))),
    [series, sites, m],
  );
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const labelEvery = Math.max(1, Math.ceil(series.length / Math.max(2, Math.floor(innerW / 70))));
  const total = series.reduce((t, p) => t + sites.reduce((a, s) => a + p.values[s.id][m], 0), 0);

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const i = series.length <= 1 ? 0 : Math.round(((px - PAD.left) / innerW) * (series.length - 1));
    setHover(Math.min(series.length - 1, Math.max(0, i)));
  }

  const title = fixedTitle ?? (hourly ? "Page views today, by hour" : m === "uv" ? "Visitors per day" : "Page views per day");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          {!hourly && !fixedTitle && (
            <div className="inline-flex rounded-lg border border-[var(--a-line)] p-0.5 text-sm">
              {(
                [
                  ["uv", "Visitors"],
                  ["pv", "Page views"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setMetric(k)}
                  className={`px-3 h-7 rounded-md font-medium ${metric === k ? "bg-[var(--a-hover)] text-[var(--a-text)]" : "text-[var(--a-muted)]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setTable((t) => !t)} className="text-sm text-[var(--a-muted)] hover:text-[var(--a-text)] underline-offset-2 hover:underline px-1">
            {table ? "Show chart" : "Show table"}
          </button>
        </div>
      </div>

      {sites.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--a-muted)]">
          {sites.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className="inline-block w-4 h-[2px] rounded" style={{ background: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      {table ? (
        <div className="mt-4 max-h-[300px] overflow-auto">
          <table className="w-full text-sm tabular-nums">
            <thead className="sticky top-0 bg-white text-[var(--a-muted)]">
              <tr>
                <th className="text-left font-medium py-1.5">{hourly ? "Hour" : "Day"}</th>
                {sites.map((s) => (
                  <th key={s.id} className="text-right font-medium py-1.5">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map((p) => (
                <tr key={p.key} className="border-t border-[var(--a-line)]">
                  <td className="py-1.5">{p.label}</td>
                  {sites.map((s) => (
                    <td key={s.id} className="text-right py-1.5">{p.values[s.id][m].toLocaleString("en-US")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={box} className="relative mt-3 min-w-0 overflow-hidden">
          {total === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-[var(--a-faint)] pointer-events-none">
              No visits recorded in this period yet.
            </p>
          )}
          <svg
            width={width}
            height={H}
            className="block touch-none"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            role="img"
            aria-label={`${title}. Use “Show table” for the numbers.`}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="#edf0f3" />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="#8a96a1">
                  {t >= 1000 ? `${(t / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k` : t}
                </text>
              </g>
            ))}
            {series.map((p, i) =>
              (i % labelEvery === 0 && series.length - 1 - i >= labelEvery / 2) || i === series.length - 1 ? (
                <text
                  key={p.key}
                  x={x(i)}
                  y={H - 8}
                  textAnchor={series.length > 1 && i === 0 ? "start" : series.length > 1 && i === series.length - 1 ? "end" : "middle"}
                  fontSize="11"
                  fill="#8a96a1"
                >
                  {p.label}
                </text>
              ) : null,
            )}
            {hover !== null && (
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="#b9c3cc" strokeDasharray="3 3" />
            )}
            {sites.map((s) => {
              const d = series.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.values[s.id][m]).toFixed(1)}`).join("");
              return (
                <g key={s.id}>
                  <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {(hover !== null || series.length === 1) && (
                    <circle
                      cx={x(hover ?? 0)}
                      cy={y(series[hover ?? 0].values[s.id][m])}
                      r={4.5}
                      fill={s.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  )}
                </g>
              );
            })}
          </svg>
          {hover !== null && (
            <div
              className="pointer-events-none absolute top-2 z-10 rounded-lg bg-white border border-[var(--a-line)] shadow-lg px-3 py-2 text-sm min-w-[150px]"
              style={x(hover) > width / 2 ? { right: width - x(hover) + 12 } : { left: x(hover) + 12 }}
            >
              <p className="text-xs text-[var(--a-muted)] mb-1">{series[hover].label}</p>
              {sites.map((s) => (
                <p key={s.id} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-[2px] rounded" style={{ background: s.color }} />
                  <b className="tabular-nums">{series[hover].values[s.id][m].toLocaleString("en-US")}</b>
                  <span className="text-[var(--a-muted)]">{s.name}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
