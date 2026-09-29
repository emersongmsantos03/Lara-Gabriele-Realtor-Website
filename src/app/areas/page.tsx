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
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-36 pb-14 md:pt-40 md:pb-16">
            <p className="text-gold-light tracking-[0.25em] text-xs uppercase mb-3">
              Neighborhood guide
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl text-balance">
              Where to live in San Diego County.
            </h1>
            <p className="mt-4 max-w-xl text-cream/75 leading-relaxed">
              An honest, local look at the {areas.length} communities I help
              buyers and sellers in every day.
            </p>
          </div>
        </section>

        <section id="map" className="py-14 md:py-16 bg-cream-deep/60">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <AreaMap points={getMapPoints()} regions={regions} />
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-12 md:space-y-14">
            {regions.map((region) => {
              const list = areas.filter((a) => a.region === region);
              if (!list.length) return null;
              return (
                <Reveal key={region}>
                  <h2 className="font-display text-2xl md:text-3xl">{region}</h2>
                  <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {list.map((area) => (
                      <Link
                        key={area.slug}
                        href={`/areas/${area.slug}`}
                        className="group flex items-start justify-between gap-4 rounded-2xl border border-line bg-cream-deep/40 p-5 hover:border-gold/50 hover:bg-cream-deep/70 transition-colors"
                      >
                        <span className="min-w-0">
                          <span className="block font-display text-xl group-hover:text-gold transition-colors">
                            {area.name}
                          </span>
                          <span className="mt-1 block text-sm text-ink-soft leading-relaxed line-clamp-2">
                            {area.blurb}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={16}
                          className="mt-1 shrink-0 text-ink-soft group-hover:text-gold transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </Link>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <LocalInsight />
        <ContactSection />
      </main>
      <Footer />
      <StickyMobileBar />
      <BackToTop />
    </>
  );
}
