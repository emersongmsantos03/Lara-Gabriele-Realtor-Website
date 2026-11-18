import type { SiteId } from "./sites";

// Shared by the server, the admin UI and the public blog API.

export type PostStatus = "draft" | "scheduled" | "published";

export type Post = {
  id: string;
  slug: string;
  title: string;
  /** Short summary for cards and search results. Auto-filled if left empty. */
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  contentHtml: string;
  sites: SiteId[];
  status: PostStatus;
  /** When the post goes (or went) live. Required for scheduled posts. */
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: string;
  updatedBy: string;
  /** Topics shown on the post and used to filter the blog. */
  tags: string[];
  /** Pinned to the top of the blog. */
  featured: boolean;
  /** Optional overrides for Google; fall back to title / excerpt. */
  seoTitle: string;
  seoDescription: string;
  /** true when the summary was generated from the text (not typed by the author). */
  excerptAuto?: boolean;
};

export type Revision = {
  at: string;
  by: string;
  status: PostStatus;
  title: string;
  excerpt: string;
  coverImage: string;
  contentHtml: string;
};

/** What the public sites receive in a list (no body). */
export type PostSummary = Pick<
  Post,
  "slug" | "title" | "excerpt" | "coverImage" | "coverAlt" | "sites" | "publishAt" | "tags" | "featured" | "seoTitle" | "seoDescription"
> & { readingMinutes: number };

/** Older posts were saved before these fields existed. */
export function withDefaults(p: Post): Post {
  return { ...p, tags: p.tags ?? [], featured: p.featured ?? false, seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "" };
}

/** Scheduled posts become live by themselves once their time arrives. */
export function liveStatus(p: Pick<Post, "status" | "publishAt">, now = Date.now()): PostStatus {
  if (p.status === "draft") return "draft";
  if (p.publishAt && new Date(p.publishAt).getTime() > now) return "scheduled";
  return "published";
}

export function isLive(p: Pick<Post, "status" | "publishAt">, now = Date.now()) {
  return liveStatus(p, now) === "published";
}

export function slugify(s: string) {
  return (
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "") || "post"
  );
}

/** Local-dev uploads are saved with a full localhost address; serve them as a path. */
export function imageSrc(url: string) {
  return url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?=\/uploads\/)/, "");
}

export function formatPostDate(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" })
    : "";
}
