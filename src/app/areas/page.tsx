import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import LocalInsight from "@/components/LocalInsight";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyMobileBar from "@/components/StickyMobileBar";
import BackToTop from "@/components/BackToTop";
import Reveal from "@/components/Reveal";
import AreaMap from "@/components/AreaMap";
import { areas, regions } from "@/lib/areas";
import { getMapPoints } from "@/lib/map-points";
import { site, jsonLdScript } from "@/lib/site";

const description =
  "Explore San Diego neighborhoods with local REALTOR® Lara Gabriele — La Jolla, Del Mar, Carlsbad, Coronado, Point Loma, Encinitas, Carmel Valley and more. Homes, schools, and lifestyle for every community.";

export const metadata: Metadata = {
  title: "San Diego Neighborhood Guide — Where to Live in San Diego County",
  description,
  alternates: { canonical: "/areas" },
  openGraph: {
    title: "San Diego Neighborhood Guide | Lara Gabriele",
    description,
    url: "/areas",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${site.url}/areas`,
      url: `${site.url}/areas`,
      name: "San Diego Neighborhood Guide",
      description,
      isPartOf: { "@id": `${site.url}/#website` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: areas.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: a.name,
          url: `${site.url}/areas/${a.slug}`,
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Neighborhoods", item: `${site.url}/areas` },
      ],
    },
  ],
};

export default function AreasIndex() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(jsonLd)}
      />
      <NavBar />
      <main className="flex-1">
        <section id="top" className="relative bg-ink text-cream overflow-hidden">
          <Image
            src="/images/hero-poster.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-40 pb-20 md:pt-48 md:pb-28">
            <p className="text-gold-light tracking-[0.3em] text-xs md:text-sm uppercase mb-5">
              Neighborhood guide
            </p>
            <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-6xl md:text-7xl max-w-4xl text-balance">
              Where to live in San Diego County.
            </h1>
            <p className="mt-6 max-w-2xl text-cream/80 text-base md:text-lg leading-relaxed">
              Every community here has its own personality, price range, and
              school story. Here&rsquo;s an honest, local look at the areas I
              help buyers and sellers in every day.
            </p>
          </div>
        </section>

        <section id="map" className="py-16 md:py-24 bg-cream-deep">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl">Explore the map</h2>
              <p className="mt-3 text-ink-soft max-w-xl">
                From the beach towns to the inland hills — filter by region
                and pick a pin for the quick guide.
              </p>
            </Reveal>
            <div className="mt-10">
              <AreaMap points={getMapPoints()} regions={regions} />
            </div>
          </div>
        </section>

        {regions.map((region) => {
          const list = areas.filter((a) => a.region === region);
          if (!list.length) return null;
          return (
            <section key={region} className="py-16 md:py-20 border-b border-line last:border-0">
              <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <Reveal>
                  <h2 className="font-display text-3xl md:text-4xl">{region}</h2>
                </Reveal>
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((area, i) => (
                    <Reveal key={area.slug} delay={(i % 3) * 80}>
                      <Link
                        href={`/areas/${area.slug}`}
                        className="group flex flex-col h-full rounded-2xl overflow-hidden border border-line bg-cream-deep/40 hover:border-gold/60 hover:shadow-xl hover:shadow-ink/5 hover:-translate-y-1 transition-all duration-300"
                      >
                        {area.image && (
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <Image
                              src={area.image}
                              alt={`${area.name}, San Diego`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            />
                          </div>
                        )}
                        <div className="p-7 flex-1 flex flex-col">
                          <p className="text-xs tracking-[0.2em] uppercase text-gold">
                            {area.tagline}
                          </p>
                          <h3 className="mt-3 font-display text-2xl group-hover:text-gold transition-colors">
                            {area.name}
                          </h3>
                          <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">
                            {area.blurb}
                          </p>
                          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                            Explore {area.name}
                            <ArrowUpRight
                              size={15}
                              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </span>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <LocalInsight />
        <ContactSection />
      </main>
      <Footer />
      <StickyMobileBar />
      <BackToTop />
    </>
  );
}
