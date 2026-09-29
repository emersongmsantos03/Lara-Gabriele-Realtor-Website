import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyMobileBar from "@/components/StickyMobileBar";
import BackToTop from "@/components/BackToTop";
import Reveal from "@/components/Reveal";
import { guides } from "@/lib/guides";
import { site, jsonLdScript } from "@/lib/site";

const description =
  "Home buying and selling guides from Lara Gabriele, a former senior mortgage underwriter turned San Diego REALTOR® — how underwriting works, why offers fall through, and how to make yours stronger.";

export const metadata: Metadata = {
  title: "Buyer & Seller Guides from a Former Mortgage Underwriter",
  description,
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Buyer & Seller Guides | Lara Gabriele",
    description,
    url: "/guides",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${site.url}/guides`,
  url: `${site.url}/guides`,
  name: "Buyer & Seller Guides",
  description,
  isPartOf: { "@id": `${site.url}/#website` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: guides.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.title,
      url: `${site.url}/guides/${g.slug}`,
    })),
  },
};

export default function GuidesIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <NavBar />
      <main className="flex-1">
        <section id="top" className="bg-ink text-cream">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-36 pb-14 md:pt-40 md:pb-16">
            <p className="text-gold-light tracking-[0.25em] text-xs uppercase mb-3">Guides</p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl text-balance">
              Buying and selling, from the lender&rsquo;s side of the table.
            </h1>
            <p className="mt-4 max-w-xl text-cream/75 leading-relaxed">
              What I learned in 15 years as a senior mortgage underwriter, in
              plain language.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <Reveal>
              <ul className="divide-y divide-line border-y border-line">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="group flex items-start justify-between gap-6 py-7"
                    >
                      <span>
                        <span className="text-xs tracking-[0.2em] uppercase text-gold">
                          {g.audience} &middot; {g.minutes} min read
                        </span>
                        <span className="mt-2 block font-display text-2xl leading-snug group-hover:text-gold transition-colors">
                          {g.title}
                        </span>
                        <span className="mt-2 block text-ink-soft leading-relaxed">{g.summary}</span>
                      </span>
                      <ArrowRight
                        size={18}
                        className="mt-8 shrink-0 text-ink-soft group-hover:text-gold group-hover:translate-x-0.5 transition-all"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <ContactSection />
      </main>
      <Footer />
      <StickyMobileBar />
      <BackToTop />
    </>
  );
}
