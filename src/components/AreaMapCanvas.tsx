"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { MapPoint } from "@/lib/map-points";

type Props = {
  points: MapPoint[];
  highlighted: string | null;
  selected: string | null;
  onSelect: (slug: string | null) => void;
};

export default function AreaMapCanvas({ points, highlighted, selected, onSelect }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, {
      zoomControl: false,
      // Don't hijack page scrolling: wheel zoom turns on once the map is
      // clicked, and one-finger drag is left to the page on phones.
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
    });
    L.control.zoom({ position: "topright" }).addTo(m);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    m.on("click", () => {
      m.scrollWheelZoom.enable();
      onSelectRef.current(null);
    });
    m.on("mouseout", () => m.scrollWheelZoom.disable());

    layer.current = L.layerGroup().addTo(m);
    map.current = m;

    // Leaflet measures its container once; re-measure whenever the box
    // changes size (browser zoom, window resize, late layout shifts) so tiles
    // and pins stay aligned.
    const resize = new ResizeObserver(() => m.invalidateSize());
    resize.observe(el.current);

    const current = markers.current;
    return () => {
      resize.disconnect();
      m.remove();
      map.current = null;
      layer.current = null;
      current.clear();
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    const group = layer.current;
    if (!m || !group) return;

    group.clearLayers();
    markers.current.clear();
    for (const p of points) {
      const marker = L.marker(p.coords, {
        icon: L.divIcon({ className: "map-pin", html: "<span></span>", iconSize: [22, 22] }),
        title: p.name,
        alt: p.name,
        riseOnHover: true,
      })
        .bindTooltip(p.name, { direction: "top", offset: [0, -12], className: "map-tip" })
        .on("click", () => onSelectRef.current(p.slug));
      group.addLayer(marker);
      markers.current.set(p.slug, marker);
    }
    if (points.length) {
      m.fitBounds(L.latLngBounds(points.map((p) => p.coords)), {
        padding: [56, 56],
        maxZoom: 12,
      });
    }
  }, [points]);

  const active = highlighted ?? selected;
  useEffect(() => {
    markers.current.forEach((marker, slug) => {
      const isActive = slug === active;
      marker.getElement()?.classList.toggle("is-active", isActive);
      marker.setZIndexOffset(isActive ? 1000 : 0);
      if (isActive) marker.openTooltip();
      else marker.closeTooltip();
    });
  }, [active, points]);

  useEffect(() => {
    const m = map.current;
    const marker = selected ? markers.current.get(selected) : undefined;
    if (!m || !marker) return;
    const ll = marker.getLatLng();
    if (!m.getBounds().pad(-0.2).contains(ll)) m.panTo(ll);
  }, [selected]);

  return <div ref={el} className="absolute inset-0" />;
}
