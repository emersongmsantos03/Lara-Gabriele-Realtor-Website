"use client";

import { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { reviews, type Review } from "@/lib/data";
import Reveal from "./Reveal";

function Stars({ size = 14 }: { size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className="text-gold-light fill-gold-light" aria-hidden="true" />
      ))}
    </div>
  );
}

function kindLine(r: Review) {
  const verb = { Sold: "Sold", Bought: "Bought", Rented: "Rented" }[r.kind];
  return `${verb} · ${r.place}`;
}

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Review | null>(null);
  const sources = Array.from(new Set(reviews.map((r) => r.source))).join(" & ");

  function scroll(dir: 1 | -1) {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    track.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: "smooth" });
  }

  function show(r: Review) {
    setOpen(r);
    dialogRef.current?.showModal();
  }

  return (
    <section id="reviews" className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">Client reviews</p>
              <h2 className="font-display text-3xl md:text-4xl leading-tight">
                Don&rsquo;t just take my word for it.
              </h2>
              <div className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                <Stars />
                <span className="font-medium text-ink">5.0</span>
                <span>&middot; {reviews.length} reviews on {sources}</span>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scroll(-1)}
                aria-label="Previous reviews"
                className="w-11 h-11 rounded-full border border-line flex items-center justify-center hover:bg-ink hover:text-cream hover:border-ink transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll(1)}
                aria-label="More reviews"
                className="w-11 h-11 rounded-full border border-line flex items-center justify-center hover:bg-ink hover:text-cream hover:border-ink transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div
            ref={trackRef}
            className="mt-10 -mx-6 px-6 sm:mx-0 sm:px-0 flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-6 sm:scroll-px-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((r) => (
              <figure
                key={r.id}
                className="snap-start shrink-0 w-[82%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex flex-col rounded-2xl bg-cream-deep/50 border border-line p-6 md:p-7"
              >
                <Stars size={13} />
                <blockquote className="mt-4 flex-1 font-display text-xl leading-snug text-ink">
                  &ldquo;{r.highlight}&rdquo;
                </blockquote>
                <button
                  onClick={() => show(r)}
                  className="group mt-4 self-start inline-flex items-center gap-1 text-sm font-medium text-sea hover:text-ink transition-colors"
                >
                  Read full review
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <figcaption className="mt-5 pt-4 border-t border-line">
                  <div className="text-sm font-medium text-ink">{r.author}</div>
                  <div className="text-xs text-ink-soft mt-0.5">
                    {kindLine(r)} &middot; {r.source}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-xl max-h-[85vh] rounded-2xl bg-cream text-ink p-0 shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="p-7 md:p-9">
            <div className="flex items-start justify-between gap-4">
              <Stars />
              <button
                onClick={() => dialogRef.current?.close()}
                aria-label="Close"
                className="-mt-2 -mr-2 w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-deep hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-ink-soft leading-relaxed">{open.text}</p>
            <div className="mt-6 pt-5 border-t border-line">
              <div className="font-medium">{open.author}</div>
              <div className="text-sm text-ink-soft mt-0.5">
                {kindLine(open)}
                {open.year && <> &middot; {open.year}</>} &middot; {open.source}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
