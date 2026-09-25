import Image from "next/image";
import Link from "next/link";
import { MoveUpRight, ArrowRight } from "lucide-react";
import { areas, featuredAreas, regions } from "@/lib/areas";
import { getMapPoints } from "@/lib/map-points";
import AreaMap from "./AreaMap";
import Reveal from "./Reveal";

export default function Areas() {
  return (
    <section id="areas" className="py-24 md:py-32 bg-cream-deep">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance max-w-2xl">
                Where do you want to live?
              </h2>
              <p className="mt-4 text-ink-soft max-w-lg text-lg">
                Honest local guides to San Diego&rsquo;s best communities.
              </p>
            </div>
            <Link
              href="/areas"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink border-b border-ink/30 pb-0.5 hover:border-ink self-start md:self-auto"
            >
              See all {areas.length} neighborhoods
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 md:mt-16 -mx-6 px-6 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-6 sm:scroll-px-0 [scrollbar-width:none] sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible">
          {featuredAreas.map((area, i) => (
            <Reveal key={area.slug} delay={i * 90} className="shrink-0 w-[78%] snap-start sm:w-auto">
              <Link
                href={`/areas/${area.slug}`}
                className="group relative aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden block w-full shadow-sm hover:shadow-2xl hover:shadow-ink/20 transition-shadow duration-300"
              >
                <Image
                  src={area.image!}
                  alt={`${area.name}, San Diego — homes and neighborhood`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-cream/10 rounded-2xl" />
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-cream/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-gold transition-all duration-300">
                  <MoveUpRight size={15} className="text-cream group-hover:text-ink" />
                </div>
                <div className="absolute bottom-0 p-5">
                  <h3 className="font-display text-xl text-cream">
                    {area.name}
                  </h3>
                  <p className="mt-1 text-xs text-cream/75 leading-relaxed">
                    {area.blurb}
                  </p>
                  <span className="mt-3 inline-block text-xs text-gold-light tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore {area.name} →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 md:mt-28">
          <Reveal>
            <h3 className="font-display text-3xl md:text-4xl">
              Or explore all {areas.length} on the map.
            </h3>
          </Reveal>
          <div className="mt-8">
            <AreaMap points={getMapPoints()} regions={regions} />
          </div>
        </div>
      </div>
    </section>
  );
}
