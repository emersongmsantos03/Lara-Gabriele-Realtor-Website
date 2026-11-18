"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Counts page views for the /admin dashboard. No cookies, nothing personal.
export default function VisitTracker() {
  const path = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (path.startsWith("/admin") || last.current === path) return;
    // Referrer only matters on the first page of a visit.
    const referrer = last.current === null ? document.referrer : location.origin;
    last.current = path;
    const body = JSON.stringify({ s: "pacific", u: location.href, r: referrer });
    try {
      if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) {
        fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    } catch {}
  }, [path]);

  return null;
}
