"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, MapPin, X } from "lucide-react";
// Imported here, not in AreaMapCanvas: CSS inside a lazily loaded chunk can go
// missing after client navigation or hot reload, which scatters the tiles.
import "leaflet/dist/leaflet.css";
import type { Region } from "@/lib/areas";
import type { MapPoint } from "@/lib/map-points";

// Leaflet needs `window`, so the map itself only renders in the browser.
const AreaMapCanvas = dynamic(() => import("./AreaMapCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-cream-deep" />,
});

type Filter = Region | "All";

export default function AreaMap({ points, regions }: { points: MapPoint[]; regions: Region[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "All" ? points : points.filter((p) => p.region === filter)),
    [points, filter]
  );
  const current = points.find((p) => p.slug === selected);

  function choose(f: Filter) {
    setFilter(f);
    if (current && f !== "All" && current.region !== f) setSelected(null);
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
      <div className="lg:col-span-4 flex flex-col min-w-0">
        <div
          role="group"
          aria-label="Filter by region"
          className="-mx-6 px-6 flex gap-2 overflow-x-auto [scrollbar-width:none] sm:mx-0 sm:px-0 sm:flex-wrap"
        >
          {(["All", ...regions] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => choose(f)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-ink text-cream border-ink"
                  : "border-ink/15 text-ink hover:border-ink/40"
              }`}
            >
              {f === "All" ? "All areas" : f}
            </button>
          ))}
        </div>

        <ul className="hidden lg:block mt-6 flex-1 overflow-y-auto max-h-[480px] pr-2 -mr-2 divide-y divide-line border-y border-line">
          {visible.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onMouseEnter={() => setHovered(p.slug)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p.slug)}
                onBlur={() => setHovered(null)}
                onClick={() => setSelected(p.slug)}
                aria-pressed={selected === p.slug}
                className={`group w-full text-left py-3.5 flex items-center gap-3 transition-colors ${
                  selected === p.slug ? "text-gold" : "hover:text-gold"
                }`}
              >
                <MapPin size={15} className="shrink-0 text-gold/70" />
                <span className="flex-1 min-w-0">
                  <span className="block font-display text-lg leading-tight">{p.name}</span>
                  <span className="block text-xs text-ink-soft truncate">{p.tagline}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="hidden lg:block mt-4 text-xs text-ink-soft">
          Hover a name to find it on the map, or click a pin for the quick guide.
        </p>
      </div>

      <div className="area-map lg:col-span-8 relative isolate z-0 h-[440px] sm:h-[520px] lg:h-[600px] rounded-2xl overflow-hidden border border-line shadow-sm">
        <AreaMapCanvas
          points={visible}
          highlighted={hovered}
          selected={selected}
          onSelect={setSelected}
        />

        {current ? (
          <div className="absolute z-[1000] bottom-3 inset-x-3 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[340px] rounded-xl bg-cream shadow-2xl shadow-ink/25 p-5">
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-deep hover:text-ink"
            >
              <X size={16} />
            </button>
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold pr-8">{current.region}</p>
            <h3 className="mt-1.5 font-display text-2xl">{current.name}</h3>
            <p className="mt-1 text-sm text-ink-soft leading-relaxed">{current.blurb}</p>
            {current.price && (
              <p className="mt-3 text-xs font-medium text-ink">{current.price}</p>
            )}
            <Link
              href={`/areas/${current.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink text-cream text-sm font-medium px-5 py-2.5 hover:bg-gold hover:text-ink transition-colors"
            >
              Explore {current.name}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        ) : (
          <p className="lg:hidden pointer-events-none absolute z-[1000] bottom-3 left-3 rounded-full bg-cream/95 px-4 py-2 text-xs font-medium shadow">
            Tap a pin to explore
          </p>
        )}
      </div>
    </div>
  );
}
