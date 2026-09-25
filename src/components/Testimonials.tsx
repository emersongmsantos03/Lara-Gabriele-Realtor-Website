import { Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import Reveal from "./Reveal";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-gold text-xs md:text-sm tracking-[0.25em] uppercase mb-4 text-center">
            Client stories
          </p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight text-balance text-center max-w-2xl mx-auto">
            Don&rsquo;t just take my word for it.
          </h2>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="h-full flex flex-col p-8 rounded-2xl bg-cream-deep/50 border border-line hover:border-gold/40 hover:shadow-lg hover:shadow-ink/5 transition-all duration-300">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star
                      key={star}
                      size={15}
                      className="text-gold fill-gold"
                    />
                  ))}
                </div>
                <blockquote className="mt-5 text-ink-soft leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ink text-gold-light font-display text-sm flex items-center justify-center shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">
                      {t.name}
                    </div>
                    <div className="text-xs text-ink-soft mt-0.5">
                      {t.detail}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
