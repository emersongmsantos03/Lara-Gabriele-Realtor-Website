import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import type { Moment, Stop } from "@/lib/itineraries";
import Reveal from "./Reveal";

const icons: Record<Moment, typeof Sun> = {
  Morning: Sunrise,
  Midday: Sun,
  Afternoon: Sunset,
  Evening: Moon,
};

export default function DayIn({ area, stops }: { area: string; stops: Stop[] }) {
  return (
    <section id="a-day-in" className="py-20 md:py-28 bg-cream-deep">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-gold text-xs md:text-sm tracking-[0.25em] uppercase mb-4">
            A day in the life
          </p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight text-balance max-w-3xl">
            A perfect Saturday in {area}.
          </h2>
          <p className="mt-4 text-ink-soft max-w-xl text-lg">
            What a weekend really looks like once you live here.
          </p>
        </Reveal>

        <div className="mt-14 relative">
          {/* Connecting line: vertical on mobile, horizontal from md up. */}
          <div
            aria-hidden
            className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-gold-light via-gold to-ink/60 md:left-5 md:right-[calc(25%-44px)] md:bottom-auto md:w-auto md:h-px md:bg-gradient-to-r"
          />
          <ol className="relative grid md:grid-cols-4 gap-10 md:gap-8">
          {stops.map((stop, i) => {
            const Icon = icons[stop.when];
            return (
              <li key={stop.when} className="relative">
                <Reveal delay={i * 110} className="flex md:block gap-5">
                  <div className="relative z-10 shrink-0 w-10 h-10 rounded-full bg-cream border border-gold/50 text-gold flex items-center justify-center shadow-sm">
                    <Icon size={18} />
                  </div>
                  <div className="md:mt-6">
                    <p className="text-xs tracking-[0.2em] uppercase text-ink-soft">
                      {stop.when}
                    </p>
                    <h3 className="mt-2 font-display text-xl md:text-2xl">{stop.title}</h3>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">{stop.text}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
          </ol>
        </div>
      </div>
    </section>
  );
}
