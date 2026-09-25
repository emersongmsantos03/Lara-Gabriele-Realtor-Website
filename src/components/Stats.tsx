import { stats } from "@/lib/data";
import Reveal from "./Reveal";

export default function Stats() {
  return (
    <section className="bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div
                className={`text-center md:text-left px-2 md:px-8 py-4 md:py-0 ${
                  i > 0 ? "md:border-l md:border-cream/10" : ""
                }`}
              >
                <div className="font-display text-4xl md:text-5xl text-gold-light">
                  {s.value}
                </div>
                <div className="mt-2.5 text-xs md:text-sm text-cream/60 text-balance tracking-wide">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
