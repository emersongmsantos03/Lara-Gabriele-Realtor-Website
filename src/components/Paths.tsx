import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "./Reveal";

const paths = [
  {
    id: "sell",
    eyebrow: "Selling",
    title: "Sell for the best price, without the stress.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "Modern San Diego home at dusk",
    points: [
      "Pricing from real comparables on your street",
      "Professional photos, video & staging advice",
      "eXp Luxury exposure to buyers nationwide",
    ],
    cta: { href: "#valuation", label: "Get my free home value" },
  },
  {
    id: "buy",
    eyebrow: "Buying",
    title: "Find the right home — and the right neighborhood.",
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "Palm trees on a San Diego beach",
    points: [
      "Honest advice on value, schools & commute",
      "First-time buyers, relocation & VA loans",
      "Offers structured to win without overpaying",
    ],
    cta: { href: "#contact", label: "Start my home search" },
    secondary: { href: "/areas", label: "Explore neighborhoods" },
  },
];

export default function Paths() {
  return (
    <section id="services" className="pb-24 md:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-6">
        {paths.map((p, i) => (
          <Reveal key={p.id} delay={i * 100}>
            <article
              id={p.id}
              className="group h-full flex flex-col rounded-3xl overflow-hidden bg-cream-deep/60 border border-line"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <span className="absolute top-5 left-5 text-xs tracking-[0.2em] uppercase font-medium px-3.5 py-1.5 rounded-full bg-cream text-ink">
                  {p.eyebrow}
                </span>
              </div>
              <div className="flex-1 flex flex-col p-8 md:p-10">
                <h2 className="font-display text-3xl md:text-4xl leading-tight text-balance">
                  {p.title}
                </h2>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-ink-soft">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-sea/15 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-sea" strokeWidth={3} />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <a
                    href={p.cta.href}
                    className="inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-medium px-7 py-3.5 hover:bg-gold transition-colors"
                  >
                    {p.cta.label}
                    <ArrowRight size={15} />
                  </a>
                  {p.secondary && (
                    <Link
                      href={p.secondary.href}
                      className="text-sm font-medium text-ink border-b border-ink/30 pb-0.5 hover:border-ink"
                    >
                      {p.secondary.label}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
