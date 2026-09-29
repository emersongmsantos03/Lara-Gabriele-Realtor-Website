import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  GraduationCap,
  Home,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import HomeValuation from "@/components/HomeValuation";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyMobileBar from "@/components/StickyMobileBar";
import BackToTop from "@/components/BackToTop";
import Reveal from "@/components/Reveal";
import DayIn from "@/components/DayIn";
import MarketSnapshot from "@/components/MarketSnapshot";
import { areas, getArea } from "@/lib/areas";
import { itineraries } from "@/lib/itineraries";
import { getMarketSnapshot } from "@/lib/market";
import { site, jsonLdScript } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  props: PageProps<"/areas/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const area = getArea(slug);
  if (!area) return {};

  const title = `${area.name} Realtor & Homes for Sale`;
  const description = `Buying or selling in ${area.name}, CA? Lara Gabriele is a San Diego REALTOR® and former senior mortgage underwriter. ${area.blurb} Free home valuations.`;

  return {
    title,
    description,
    alternates: { canonical: `/areas/${area.slug}` },
    openGraph: {
      title: `${title} | Lara Gabriele`,
      description,
      url: `/areas/${area.slug}`,
      type: "website",
    },
  };
}

function mapSrc([lat, lng]: [number, number]) {
  const bbox = [lng - 0.05, lat - 0.032, lng + 0.05, lat + 0.032]
    .map((n) => n.toFixed(4))
    .join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export default async function AreaPage(props: PageProps<"/areas/[slug]">) {
  const { slug } = await props.params;
  const area = getArea(slug);
  if (!area) notFound();

  const nearby = area.nearby
    .map((s) => getArea(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const stops = itineraries[area.slug];
  const market = getMarketSnapshot(area.slug);

  const pageUrl = `${site.url}/areas/${area.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: `${area.name} Realtor & Homes for Sale — Lara Gabriele`,
        description: area.blurb,
        about: {
          "@type": "Place",
          name: `${area.name}, California`,
          geo: {
            "@type": "GeoCoordinates",
            latitude: area.coords[0],
            longitude: area.coords[1],
          },
          containedInPlace: { "@type": "AdministrativeArea", name: "San Diego County, CA" },
        },
        provider: { "@id": `${site.url}/#agent` },
        isPartOf: { "@id": `${site.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Neighborhoods", item: `${site.url}/areas` },
          { "@type": "ListItem", position: 3, name: area.name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(jsonLd)}
      />
      <NavBar />
      <main className="flex-1">
        {/* Hero */}
        <section id="top" className="relative min-h-[60svh] flex items-end overflow-hidden bg-ink">
          {area.image ? (
            <Image
              src={area.image}
              alt={`${area.name}, San Diego`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <Image
              src="/images/hero-poster.jpg"
              alt=""
              fill
              priority
              className="object-cover opacity-40"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/10 to-transparent" />
          {area.image && area.imageCredit && (
            <p className="absolute z-10 bottom-3 right-4 text-[10px] text-cream/50">
              {area.imageCredit}
            </p>
          )}

          <div className="relative z-10 w-full mx-auto max-w-7xl px-6 lg:px-10 pt-32 pb-12 md:pb-16">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-cream/60">
                <li>
                  <Link href="/" className="hover:text-cream">Home</Link>
                </li>
                <li aria-hidden><ChevronRight size={12} /></li>
                <li>
                  <Link href="/areas" className="hover:text-cream">Neighborhoods</Link>
                </li>
                <li aria-hidden><ChevronRight size={12} /></li>
                <li aria-current="page" className="text-cream/90">{area.name}</li>
              </ol>
            </nav>
            <p className="text-gold-light tracking-[0.25em] text-xs uppercase mb-3">
              {area.region}
            </p>
            <h1 className="font-display text-cream text-4xl md:text-5xl leading-tight max-w-3xl text-balance">
              {area.name} Real Estate &amp; Homes for Sale
            </h1>
            <p className="mt-4 max-w-xl text-cream/80 leading-relaxed">
              {area.blurb} Guided by Lara Gabriele, your local San Diego
              REALTOR&reg;.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex items-center rounded-full bg-gold text-ink text-sm font-medium px-6 py-3 hover:bg-gold-light transition-colors"
              >
                Talk to Lara
              </a>
              <a
                href="#valuation"
                className="inline-flex items-center rounded-full border border-cream/40 text-cream text-sm font-medium px-6 py-3 hover:bg-cream/10 transition-colors"
              >
                What&rsquo;s my home worth?
              </a>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">
                  Living in {area.name}
                </p>
                <h2 className="font-display text-3xl md:text-4xl leading-tight text-balance">
                  What it&rsquo;s really like to call {area.name} home.
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div className="mt-5 space-y-4 text-ink-soft leading-relaxed md:text-lg">
                  {area.description.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={140}>
                <div className="mt-10">
                  <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold">
                    <Sparkles size={14} />
                    Why people love {area.name}
                  </div>
                  <ul className="mt-5 grid sm:grid-cols-2 gap-5">
                    {area.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex gap-3 text-sm text-ink-soft leading-relaxed border-t border-line pt-4"
                      >
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            <aside className="lg:col-span-5">
              <Reveal delay={100}>
                <div className="rounded-2xl border border-line bg-cream-deep/50 p-6 sm:p-7 space-y-6 lg:sticky lg:top-28">
                  <h2 className="font-display text-xl">{area.name} at a glance</h2>

                  <div>
                    <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold">
                      <Users size={14} /> Best for
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {area.bestFor.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium px-3 py-1.5 rounded-full bg-cream border border-line text-ink"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold">
                      <Home size={14} /> Homes you&rsquo;ll find
                    </div>
                    <p className="mt-3 text-sm text-ink-soft leading-relaxed">{area.homes}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold">
                      <GraduationCap size={14} /> Schools
                    </div>
                    <p className="mt-3 text-sm text-ink-soft leading-relaxed">{area.schools}</p>
                    <p className="mt-2 text-xs text-ink-soft/70">
                      Boundaries can change — always confirm with the district for a specific address.
                    </p>
                  </div>

                  {area.pockets.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold">
                        <MapPin size={14} /> Neighborhoods within
                      </div>
                      <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                        {area.pockets.join(" · ")}
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl overflow-hidden border border-line h-40">
                    <iframe
                      title={`Map of ${area.name}, San Diego County`}
                      src={mapSrc(area.coords)}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>

                  <a
                    href="#contact"
                    className="w-full inline-flex items-center justify-center rounded-full bg-ink text-cream text-sm font-medium px-7 py-3.5 hover:bg-gold hover:text-ink transition-colors"
                  >
                    Get {area.name} listings from Lara
                  </a>
                </div>
              </Reveal>
            </aside>
          </div>
        </section>

        {stops && <DayIn area={area.name} stops={stops} />}

        {market && <MarketSnapshot area={area.name} data={market} />}

        <HomeValuation />

        {/* Nearby */}
        {nearby.length > 0 && (
          <section className="pb-16 md:pb-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <Reveal>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <h2 className="font-display text-2xl md:text-3xl">
                    Also consider nearby
                  </h2>
                  <Link
                    href="/areas"
                    className="group inline-flex items-center gap-1.5 text-sm font-medium hover:text-gold transition-colors self-start"
                  >
                    All neighborhoods
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
              <div className="mt-6 grid md:grid-cols-3 gap-3">
                {nearby.map((n, i) => (
                  <Reveal key={n.slug} delay={i * 80}>
                    <Link
                      href={`/areas/${n.slug}`}
                      className="group block h-full rounded-2xl border border-line bg-cream-deep/40 p-5 hover:border-gold/50 hover:bg-cream-deep/70 transition-colors"
                    >
                      <h3 className="font-display text-xl group-hover:text-gold transition-colors">
                        {n.name}
                      </h3>
                      <p className="mt-1 text-sm text-ink-soft leading-relaxed">{n.blurb}</p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        <ContactSection area={area.name} />
      </main>
      <Footer />
      <StickyMobileBar />
      <BackToTop />
    </>
  );
}
