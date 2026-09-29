import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { areas, featuredAreas } from "@/lib/areas";
import Reveal from "./Reveal";

// Homepage teaser only — the full map and all guides live on /areas.
export default function Areas() {
  return (
    <section id="areas" className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">Neighborhoods</p>
              <h2 className="font-display text-3xl md:text-4xl leading-tight">
                Where do you want to live?
              </h2>
            </div>
            <Link
              href="/areas"
              className="group inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap text-sm font-medium text-ink hover:text-gold transition-colors"
            >
              All {areas.length} neighborhoods &amp; map
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-8 -mx-6 px-6 flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-4 sm:overflow-visible">
            {featuredAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="group relative shrink-0 w-[44%] sm:w-auto snap-start aspect-[3/4] rounded-2xl overflow-hidden"
              >
                <Image
                  src={area.image!}
                  alt={`${area.name}, San Diego — homes and neighborhood`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 44vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-lg leading-tight text-cream">{area.name}</h3>
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-cream/75 group-hover:text-gold-light transition-colors">
                    Explore
                    <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
