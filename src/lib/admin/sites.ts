// The three websites the admin manages. Safe to import from client code.
// `id` is stored with every post and every analytics hit, so never rename one.

export const SITE_IDS = ["pacific", "santafe", "lomasverdes"] as const;
export type SiteId = (typeof SITE_IDS)[number];

export type SiteInfo = {
  id: SiteId;
  name: string;
  short: string;
  domain: string;
  url: string;
  /** Brand color used for this site in charts and badges. */
  color: string;
  /** Public URL of a post on this site. */
  postUrl: (slug: string) => string;
  blogUrl: string;
};

const mainUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.pacificfriendlyrealty.com").replace(/\/$/, "");

export const SITES: Record<SiteId, SiteInfo> = {
  pacific: {
    id: "pacific",
    name: "Pacific Friendly Realty",
    short: "Pacific Friendly",
    domain: "pacificfriendlyrealty.com",
    url: mainUrl,
    color: "#2a78d6",
    postUrl: (slug) => `${mainUrl}/blog/${slug}`,
    blogUrl: `${mainUrl}/blog`,
  },
  santafe: {
    id: "santafe",
    name: "Santa Fe Hills",
    short: "Santa Fe Hills",
    domain: "santafehillssd.com",
    url: "https://santafehillssd.com",
    color: "#eb6834",
    postUrl: (slug) => `https://santafehillssd.com/blog/post.html?slug=${encodeURIComponent(slug)}`,
    blogUrl: "https://santafehillssd.com/blog/",
  },
  lomasverdes: {
    id: "lomasverdes",
    name: "Lomas Verdes Estates",
    short: "Lomas Verdes",
    domain: "lomasverdesestates.com",
    url: "https://lomasverdesestates.com",
    color: "#1baf7a",
    postUrl: (slug) => `https://lomasverdesestates.com/blog/post.html?slug=${encodeURIComponent(slug)}`,
    blogUrl: "https://lomasverdesestates.com/blog/",
  },
};

export const SITE_LIST = SITE_IDS.map((id) => SITES[id]);

export function isSiteId(v: unknown): v is SiteId {
  return typeof v === "string" && (SITE_IDS as readonly string[]).includes(v);
}

/** Domains allowed to send analytics and read the public blog API. */
export const ALLOWED_ORIGINS = [
  "https://www.pacificfriendlyrealty.com",
  "https://pacificfriendlyrealty.com",
  "https://santafehillssd.com",
  "https://www.santafehillssd.com",
  "https://lomasverdesestates.com",
  "https://www.lomasverdesestates.com",
];
