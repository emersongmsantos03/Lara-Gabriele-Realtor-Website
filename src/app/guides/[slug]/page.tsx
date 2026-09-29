import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyMobileBar from "@/components/StickyMobileBar";
import BackToTop from "@/components/BackToTop";
import { guides, getGuide } from "@/lib/guides";
import { site, jsonLdScript } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: `${guide.title} | Lara Gabriele`,
      description: guide.summary,
      url: `/guides/${guide.slug}`,
      type: "article",
    },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const others = guides.filter((g) => g.slug !== guide.slug);
  const pageUrl = `${site.url}/guides/${guide.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": pageUrl,
        url: pageUrl,
        headline: guide.title,
        description: guide.summary,
        dateModified: guide.updated,
        author: {
          "@type": "Person",
          name: site.agent,
          jobTitle: "REALTOR®, former senior mortgage underwriter",
          url: site.url,
        },
        publisher: { "@id": `${site.url}/#agent` },
        isPartOf: { "@id": `${site.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${site.url}/guides` },
          { "@type": "ListItem", position: 3, name: guide.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <NavBar />
      <main className="flex-1">
        <section id="top" className="bg-ink text-cream">
          <div className="mx-auto max-w-3xl px-6 lg:px-10 pt-36 pb-12 md:pt-40 md:pb-14">
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-cream/60">
                <li>
                  <Link href="/" className="hover:text-cream">Home</Link>
                </li>
                <li aria-hidden><ChevronRight size={12} /></li>
                <li>
                  <Link href="/guides" className="hover:text-cream">Guides</Link>
                </li>
              </ol>
            </nav>
            <h1 className="font-display text-3xl md:text-5xl leading-tight text-balance">
              {guide.title}
            </h1>
            <p className="mt-4 text-sm text-cream/60">
              By {site.agent}, former senior mortgage underwriter &middot; {guide.minutes} min read
              &middot; Updated {formatDate(guide.updated)}
            </p>
          </div>
        </section>

        <article className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            {guide.sections.map((section, i) => (
              <section key={section.heading ?? i} className={i ? "mt-10" : ""}>
                {section.heading && (
                  <h2 className="font-display text-2xl leading-snug">{section.heading}</h2>
                )}
                <div className={`space-y-4 text-ink-soft leading-relaxed md:text-lg ${section.heading ? "mt-3" : ""}`}>
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 32)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-12 rounded-2xl bg-cream-deep/70 border border-line p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <p className="font-display text-xl">Want a second set of eyes on your financing?</p>
                <p className="mt-1 text-sm text-ink-soft">
                  I&rsquo;ll tell you honestly where your offer stands.
                </p>
              </div>
              <a
                href="#contact"
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-medium px-6 py-3 hover:bg-gold transition-colors"
              >
                Talk to Lara
                <ArrowRight size={15} />
              </a>
            </div>

            {others.length > 0 && (
              <div className="mt-12">
                <p className="text-xs tracking-[0.2em] uppercase text-gold">More guides</p>
                <ul className="mt-3 divide-y divide-line border-y border-line">
                  {others.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/guides/${g.slug}`}
                        className="group flex items-center justify-between gap-4 py-4 font-display text-lg hover:text-gold transition-colors"
                      >
                        {g.title}
                        <ArrowRight size={16} className="shrink-0 text-ink-soft group-hover:text-gold" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        <ContactSection />
      </main>
      <Footer />
      <StickyMobileBar />
      <BackToTop />
    </>
  );
}
