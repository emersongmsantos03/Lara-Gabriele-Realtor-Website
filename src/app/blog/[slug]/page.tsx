import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, ListOrdered } from "lucide-react";
import NavBar from "@/components/NavBar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyMobileBar from "@/components/StickyMobileBar";
import BackToTop from "@/components/BackToTop";
import PostCard from "@/components/blog/PostCard";
import ShareBar from "@/components/blog/ShareBar";
import PostReader from "@/components/blog/PostReader";
import Newsletter from "@/components/blog/Newsletter";
import { livePostBySlug, livePosts, readingMinutes } from "@/lib/admin/posts";
import { formatPostDate, imageSrc } from "@/lib/admin/post-types";
import { withHeadingIds } from "@/lib/admin/toc";
import { site, jsonLdScript } from "@/lib/site";
import "../../post-body.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await livePostBySlug("pacific", slug).catch(() => null);
  if (!post) return { title: "Article not found" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title,
    description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishAt ?? undefined,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.coverAlt }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPost(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const posts = await livePosts("pacific").catch(() => []);
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const { html, toc } = withHeadingIds(post.contentHtml);
  const showToc = toc.length >= 3;
  const others = posts.filter((p) => p.id !== post.id);
  const related = [
    ...others.filter((p) => p.tags.some((t) => post.tags.includes(t))),
    ...others.filter((p) => !p.tags.some((t) => post.tags.includes(t))),
  ].slice(0, 3);
  const pageUrl = `${site.url}/blog/${post.slug}`;
  const minutes = readingMinutes(post.contentHtml);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": pageUrl,
        url: pageUrl,
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        datePublished: post.publishAt,
        dateModified: post.updatedAt,
        image: post.coverImage || undefined,
        keywords: post.tags.join(", ") || undefined,
        timeRequired: `PT${minutes}M`,
        author: { "@type": "Person", name: site.agent, url: site.url },
        publisher: { "@id": `${site.url}/#agent` },
        isPartOf: { "@id": `${site.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <PostReader slug={post.slug} articleId="article-body" />
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
                  <Link href="/blog" className="hover:text-cream">Blog</Link>
                </li>
              </ol>
            </nav>
            {post.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="rounded-full border border-gold-light/50 text-gold-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-gold-light hover:text-ink transition-colors">
                    {t}
                  </Link>
                ))}
              </div>
            )}
            <h1 className="font-display text-3xl md:text-5xl leading-tight text-balance">{post.title}</h1>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-3">
                <Image src="/images/lara-headshot.jpg" alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                <div className="text-sm">
                  <p className="text-cream">{site.agent}, {site.title}</p>
                  <p className="text-cream/60">
                    {formatPostDate(post.publishAt)} &middot; {minutes} min read
                  </p>
                </div>
              </div>
              <ShareBar slug={post.slug} url={pageUrl} title={post.title} dark />
            </div>
          </div>
        </section>

        <article className="py-12 md:py-16">
          {post.coverImage && (
            <div className="mx-auto max-w-5xl px-6 lg:px-10 -mt-2 mb-12">
              <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-cream-deep shadow-[0_30px_60px_-30px_rgba(14,43,64,0.45)]">
                <Image src={imageSrc(post.coverImage)} alt={post.coverAlt} fill priority sizes="(min-width: 1024px) 960px, 100vw" className="object-cover" />
              </div>
            </div>
          )}

          <div className={`mx-auto px-6 lg:px-10 ${showToc ? "max-w-6xl xl:grid xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-14" : "max-w-3xl"}`}>
            {showToc && (
              <aside className="hidden xl:block">
                <nav aria-label="In this article" className="sticky top-28">
                  <p className="text-xs tracking-[0.2em] uppercase text-gold">In this article</p>
                  <ol className="mt-4 space-y-2.5 border-l border-line">
                    {toc.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="block -ml-px border-l-2 border-transparent pl-4 text-sm leading-snug text-ink-soft hover:text-ink hover:border-gold">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            )}

            <div className={showToc ? "max-w-3xl" : ""}>
              {showToc && (
                <details className="xl:hidden mb-10 rounded-2xl border border-line bg-cream-deep/50 px-5 py-4">
                  <summary className="flex items-center gap-2 cursor-pointer font-medium">
                    <ListOrdered size={17} className="text-gold" /> In this article
                  </summary>
                  <ol className="mt-3 space-y-2 pl-6 list-decimal text-ink-soft">
                    {toc.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="hover:text-gold">{h.text}</a>
                      </li>
                    ))}
                  </ol>
                </details>
              )}

              {/* Sanitized on save (see lib/admin/sanitize.ts). */}
              <div id="article-body" className="post-body [&_h2]:scroll-mt-28" dangerouslySetInnerHTML={{ __html: html }} />

              <div className="mt-12 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="rounded-full bg-cream-deep px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-ink hover:text-cream transition-colors">
                      {t}
                    </Link>
                  ))}
                </div>
                <ShareBar slug={post.slug} url={pageUrl} title={post.title} />
              </div>

              {/* Author */}
              <div className="mt-10 rounded-3xl bg-ink text-cream p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start">
                <Image src="/images/lara-headshot.jpg" alt={site.agent} width={96} height={96} className="h-24 w-24 rounded-2xl object-cover shrink-0" />
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-gold-light">Written by</p>
                  <p className="mt-1 font-display text-2xl">{site.agent}, {site.title}</p>
                  <p className="mt-2 text-cream/75 leading-relaxed">
                    San Marcos REALTOR® and former senior mortgage underwriter, helping buyers and sellers across San Diego County with offers and financing that hold up. SRES® and luxury specialist.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-gold text-cream text-sm font-medium px-5 py-2.5 hover:bg-gold-light hover:text-ink transition-colors">
                      Talk to Lara <ArrowRight size={15} />
                    </a>
                    <a href={site.phoneHref} className="inline-flex items-center rounded-full border border-cream/30 text-sm px-5 py-2.5 hover:bg-cream hover:text-ink transition-colors">
                      {site.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="pb-16 md:pb-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-display text-2xl md:text-3xl">Keep reading</h2>
                <span className="h-px flex-1 bg-line" />
                <Link href="/blog" className="text-sm text-gold underline underline-offset-4 whitespace-nowrap">All articles</Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {related.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        <Newsletter />
        <ContactSection />
      </main>
      <Footer />
      <StickyMobileBar />
      <BackToTop />
    </>
  );
}
