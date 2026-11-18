"use client";

import { useEffect, useState } from "react";
import { trackBlog } from "./track";

/**
 * Reading progress bar + engagement tracking for one post:
 * halfway / finished reading, and clicks on buttons and links in the article.
 */
export default function PostReader({ slug, articleId }: { slug: string; articleId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = document.getElementById(articleId);
    if (!el) return;
    const sent = new Set<string>();
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(1, total)));
      setProgress(p);
      for (const [mark, ev] of [
        [0.5, "read50"],
        [0.95, "read100"],
      ] as const) {
        if (p >= mark && !sent.has(ev)) {
          sent.add(ev);
          trackBlog(slug, ev);
        }
      }
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !el.contains(a)) return;
      const isButton = !!a.closest('[data-type="button"]');
      let label = (a.textContent || "").trim().slice(0, 50);
      try {
        const host = new URL(a.href).hostname.replace(/^www\./, "");
        if (!isButton) label = `${label || "Link"} → ${a.href.startsWith("tel:") ? "phone" : a.href.startsWith("mailto:") ? "email" : host}`;
      } catch {}
      trackBlog(slug, "click", `${isButton ? "Button: " : ""}${label}`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("click", onClick);
    };
  }, [slug, articleId]);

  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-[3px] pointer-events-none" aria-hidden>
      <div className="h-full bg-gold origin-left transition-transform duration-150" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
