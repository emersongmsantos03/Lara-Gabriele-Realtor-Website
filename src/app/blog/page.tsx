import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, TrendingUp } from "lucide-react";
import NavBar from "@/components/NavBar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import StickyMobileBar from "@/components/StickyMobileBar";
import BackToTop from "@/components/BackToTop";
import PostCard, { CoverFallback } from "@/components/blog/PostCard";
import Newsletter from "@/components/blog/Newsletter";
import { livePosts, readingMinutes } from "@/lib/admin/posts";
import { allTimePostTotals } from "@/lib/admin/analytics";
import { formatPostDate, imageSrc } from "@/lib/admin/post-types";
import { site, jsonLdScript } from "@/lib/site";

// Posts are written in /admin. Rendered per request so scheduled posts appear
// the moment their time comes.
export const dynamic = "force-dynamic";

const PER_PAGE = 9;
const description =
  "San Diego real estate news, market updates and buying & selling advice from Lara Gabriele, REALTOR® and former senior mortgage underwriter.";

export async function generateMetadata(props: PageProps<"/blog">): Promise<Metadata> {
  const { tag } = await props.searchParams;
  const t = typeof tag === "string" ? tag : "";
  return {
    title: t ? `${t} — Blog` : "Blog — San Diego Real Estate News & Advice",
    description,
    alternates: { canonical: t ? `/blog?tag=${encodeURIComponent(t)}` : "/blog" },
    openGraph: { title: "Blog | Lara Gabriele", description, url: "/blog" },
  };
}

export default async function BlogIndex(props: PageProps<"/blog">) {
  const sp = await props.searchParams;
  const tag = typeof sp.tag === "string" ? sp.tag : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const [posts, totals] = await Promise.all([livePosts("pacific").catch(() => []), allTimePostTotals().catch(() => ({}) as Record<string, { views: number }>)]);
  const tags = [...new Set(posts.flatMap((p) => p.tags))];
  const filtering = Boolean(tag || q);
  const filtered = posts.filter(
    (p) =>
      (!tag || p.tags.includes(tag)) &&
      (!q || `${p.title} ${p.excerpt} ${p.tags.join(" ")} ${p.contentHtml.replace(/<[^>]+>/g, " ")}`.toLowerCase().includes(q.toLowerCase())),
  );

  const featured = !filtering && page === 1 ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;
  const pages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const shown = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const popular = [...posts]
    .filter((p) => (totals[p.slug]?.views ?? 0) > 0 && p.id !== featured?.id)
    .sort((a, b) => (totals[b.slug]?.views ?? 0) - (totals[a.slug]?.views ?? 0))
    .slice(0, 4);
  const sideList = popular.length >= 2 ? popular : posts.filter((p) => p.id !== featured?.id).slice(0, 4);

  const qs = (o: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(o)) if (v) u.set(k, String(v));
    const s = u.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site.url}/blog`,
    url: `${site.url}/blog`,
    name: `${site.brand} Blog`,
    description,
    publisher: { "@id": `${site.url}/#agent` },
    blogPost: posts.slice(0, 20).map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${site.url}/blog/${p.slug}`, datePublished: p.publishAt })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <NavBar />
      <main className="flex-1">
        <section id="top" className="bg-ink text-cream">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-36 pb-12 md:pt-40 md:pb-14">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <p className="text-gold-light tracking-[0.25em] text-xs uppercase mb-3">The Pacific Friendly Blog</p>
                <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl text-balance">News &amp; advice from San Diego&rsquo;s neighborhoods</h1>
                <p className="mt-4 max-w-xl text-cream/75 leading-relaxed">Market updates, new listings, local events and honest buying &amp; selling tips.</p>
              </div>
              <form action="/blog" className="relative w-full lg:w-80 shrink-0" role="search">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/50" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search articles"
                  aria-label="Search articles"
                  className="w-full h-12 rounded-full bg-cream/10 border border-cream/20 pl-11 pr-4 text-cream placeholder:text-cream/50 outline-none focus:border-gold-light focus:bg-cream/15"
                />
              </form>
            </div>
            {tags.length > 0 && (
              <nav aria-label="Topics" className="mt-8 flex flex-wrap gap-2">
                <Link href="/blog" className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${!tag ? "bg-cream text-ink border-cream" : "border-cream/25 text-cream/80 hover:border-cream/60"}`}>
                  All
                </Link>
                {tags.map((t) => (
                  <Link
                    key={t}
                    href={qs({ tag: t })}
                    className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${tag === t ? "bg-cream text-ink border-cream" : "border-cream/25 text-cream/80 hover:border-cream/60"}`}
                  >
                    {t}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            {filtering && (
              <div className="mb-10 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl md:text-3xl">
                  {q ? <>Results for &ldquo;{q}&rdquo;</> : tag}
                  <span className="ml-3 text-base font-body text-ink-soft">
                    {filtered.length} {filtered.length === 1 ? "article" : "articles"}
                  </span>
                </h2>
                <Link href="/blog" className="text-sm text-gold underline underline-offset-4">
                  See all articles
                </Link>
              </div>
            )}

            {posts.length === 0 ? (
              <p className="text-center text-ink-soft py-10">
                New articles are on the way. In the meantime, take a look at the{" "}
                <Link href="/guides" className="text-gold underline">buyer &amp; seller guides</Link>.
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-ink-soft py-10">No articles match that yet. Try another word or topic.</p>
            ) : (
              <>
                {featured && (
                  <div className="grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-14 mb-16">
                    <Link href={`/blog/${featured.slug}`} className="group block">
                      <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-cream-deep">
                        {featured.coverImage ? (
                          <Image
                            src={imageSrc(featured.coverImage)}
                            alt={featured.coverAlt}
                            fill
                            priority
                            sizes="(min-width: 1024px) 800px, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <CoverFallback />
                        )}
                        <span className="absolute left-4 top-4 rounded-full bg-gold text-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                          {featured.featured ? "Featured" : "Latest"}
                        </span>
                      </div>
                      <p className="mt-6 text-xs tracking-[0.2em] uppercase text-gold">
                        {featured.tags[0] ? `${featured.tags[0]} · ` : ""}
                        {formatPostDate(featured.publishAt)} &middot; {readingMinutes(featured.contentHtml)} min read
                      </p>
                      <h2 className="mt-3 font-display text-3xl md:text-[40px] leading-tight group-hover:text-gold transition-colors text-balance">{featured.title}</h2>
                      <p className="mt-4 text-ink-soft leading-relaxed md:text-lg max-w-2xl">{featured.excerpt}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
                        Read article <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>

                    {sideList.length > 0 && (
                      <aside>
                        <p className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold">
                          <TrendingUp size={15} /> {popular.length >= 2 ? "Most read" : "More to read"}
                        </p>
                        <ol className="mt-4 divide-y divide-line border-y border-line">
                          {sideList.map((p, i) => (
                            <li key={p.id}>
                              <Link href={`/blog/${p.slug}`} className="group flex gap-4 py-5">
                                <span className="font-display text-3xl leading-none text-gold/70 w-7 shrink-0">{i + 1}</span>
                                <span>
                                  <span className="block font-display text-lg leading-snug group-hover:text-gold transition-colors">{p.title}</span>
                                  <span className="mt-1 block text-xs text-ink-soft">{readingMinutes(p.contentHtml)} min read</span>
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </aside>
                    )}
                  </div>
                )}

                {shown.length > 0 && (
                  <>
                    {featured && (
                      <div className="flex items-center gap-4 mb-8">
                        <h2 className="font-display text-2xl">Latest articles</h2>
                        <span className="h-px flex-1 bg-line" />
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                      {shown.map((p) => (
                        <PostCard key={p.id} post={p} />
                      ))}
                    </div>
                  </>
                )}

                {pages > 1 && (
                  <nav aria-label="Pages" className="mt-14 flex items-center justify-center gap-2">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                      <Link
                        key={n}
                        href={qs({ tag, q, page: n > 1 ? n : undefined })}
                        aria-current={n === page ? "page" : undefined}
                        className={`h-10 min-w-10 px-3 inline-flex items-center justify-center rounded-full text-sm border ${n === page ? "bg-ink text-cream border-ink" : "border-line hover:border-ink"}`}
                      >
                        {n}
                      </Link>
                    ))}
                  </nav>
                )}
              </>
            )}
          </div>
        </section>

        <Newsletter />
        <ContactSection />
      </main>
      <Footer />
      <StickyMobileBar />
      <BackToTop />
    </>
  );
}
