import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

const paths = [
  {
    id: "sell",
    eyebrow: "Selling",
    title: "Sell for the best price, without the stress.",
    body: "Honest pricing, eXp Luxury exposure — and offers vetted by a former underwriter, so you pick a buyer who will actually close.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Modern San Diego home at dusk",
    cta: { href: "#valuation", label: "Get my home value" },
  },
  {
    id: "buy",
    eyebrow: "Buying",
    title: "Find the right home and neighborhood.",
    body: "Offers and financing built to hold up, plus honest advice on value, schools and commute.",
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Palm trees on a San Diego beach",
    cta: { href: "#contact", label: "Start my search" },
  },
];

export default function Paths() {
  return (
    <section id="services" className="pb-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-2 gap-5">
        {paths.map((p, i) => (
          <Reveal key={p.id} delay={i * 100}>
            <article
              id={p.id}
              className="group h-full flex flex-col rounded-2xl overflow-hidden bg-cream-deep/50 border border-line"
            >
              <div className="relative aspect-[2/1] md:aspect-[5/2] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <span className="absolute top-4 left-4 text-[11px] tracking-[0.2em] uppercase font-medium px-3 py-1 rounded-full bg-cream text-ink">
                  {p.eyebrow}
                </span>
              </div>
              <div className="flex-1 flex flex-col p-6 md:p-7">
                <h2 className="font-display text-2xl md:text-[1.7rem] leading-tight text-balance">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{p.body}</p>
                <a
                  href={p.cta.href}
                  className="group/cta mt-5 self-start inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors"
                >
                  {p.cta.label}
                  <ArrowRight size={15} className="transition-transform group-hover/cta:translate-x-0.5" />
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
