import "server-only";
import { unstable_cache } from "next/cache";
import { sql, transaction, type Q } from "./db";
import { cleanPostHtml, htmlToText } from "./sanitize";
import { isSiteId, type SiteId } from "./sites";
import { isLive, slugify, type Post, type PostStatus, type PostSummary, type Revision } from "./post-types";

// Blog posts in Postgres. Public pages read through a short cache that is
// cleared on every save (tag "posts"); scheduled posts are filtered by time
// at read time, so they appear on the minute without any background job.

export const POSTS_TAG = "posts";

type PostRow = {
  id: string; slug: string; title: string; excerpt: string; excerpt_auto: boolean; cover_image: string; cover_alt: string;
  content_html: string; sites: string[]; status: PostStatus; publish_at: Date | null; tags: string[]; featured: boolean;
  seo_title: string; seo_description: string; author: string; updated_by: string; created_at: Date; updated_at: Date; deleted_at: Date | null;
};

const iso = (d: Date | string | null) => (d ? new Date(d).toISOString() : null);

function toPost(r: PostRow): Post & { deletedAt: string | null } {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    excerptAuto: r.excerpt_auto,
    coverImage: r.cover_image,
    coverAlt: r.cover_alt,
    contentHtml: r.content_html,
    sites: r.sites.filter(isSiteId),
    status: r.status,
    publishAt: iso(r.publish_at),
    createdAt: iso(r.created_at)!,
    updatedAt: iso(r.updated_at)!,
    author: r.author,
    updatedBy: r.updated_by,
    tags: r.tags,
    featured: r.featured,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    deletedAt: iso(r.deleted_at),
  };
}

const ORDER = `ORDER BY CASE WHEN status = 'draft' THEN updated_at ELSE coalesce(publish_at, updated_at) END DESC`;

/** All posts not in the trash (admin). */
export async function allPosts(): Promise<Post[]> {
  return (await sql<PostRow>(`SELECT * FROM posts WHERE deleted_at IS NULL ${ORDER}`)).map(toPost);
}

export async function trashedPosts() {
  return (await sql<PostRow>(`SELECT * FROM posts WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`)).map(toPost);
}

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function getPost(id: string): Promise<Post | null> {
  if (!isUuid(id)) return null;
  const [r] = await sql<PostRow>(`SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return r ? toPost(r) : null;
}

export async function allTags(): Promise<string[]> {
  const rows = await sql<{ tag: string }>(
    `SELECT tag FROM posts, unnest(tags) AS tag WHERE deleted_at IS NULL GROUP BY tag ORDER BY count(*) DESC, tag`,
  );
  return rows.map((r) => r.tag);
}

export function readingMinutes(html: string) {
  const words = htmlToText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function toSummary(p: Post): PostSummary {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    coverAlt: p.coverAlt,
    sites: p.sites,
    publishAt: p.publishAt,
    tags: p.tags,
    featured: p.featured,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    readingMinutes: readingMinutes(p.contentHtml),
  };
}

/** Published + scheduled posts, cached (5 min max, cleared on every save). */
const publicPosts = unstable_cache(
  async () => (await sql<PostRow>(`SELECT * FROM posts WHERE deleted_at IS NULL AND status <> 'draft' ORDER BY publish_at DESC`)).map(toPost),
  ["public-posts-v1"],
  { tags: [POSTS_TAG], revalidate: 300 },
);

/** Posts that are live right now on one site: pinned first, then newest. */
export async function livePosts(site: SiteId): Promise<Post[]> {
  const now = Date.now();
  return (await publicPosts())
    .filter((p) => p.sites.includes(site) && isLive(p, now))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || (b.publishAt || "").localeCompare(a.publishAt || ""));
}

export async function livePostBySlug(site: SiteId, slug: string) {
  return (await livePosts(site)).find((p) => p.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Saving

export type PostInput = Partial<
  Pick<
    Post,
    | "title" | "slug" | "excerpt" | "coverImage" | "coverAlt" | "contentHtml" | "sites" | "status" | "publishAt"
    | "tags" | "featured" | "seoTitle" | "seoDescription"
  >
> & {
  /** true = a deliberate checkpoint (manual save, publish, update) for version history. */
  checkpoint?: boolean;
  /** The updatedAt the editor last saw; a mismatch means someone else saved in between. */
  expectedUpdatedAt?: string;
};

export class PostError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function cleanTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const t of v) {
    const tag = typeof t === "string" ? t.replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 30) : "";
    if (tag && !out.some((o) => o.toLowerCase() === tag.toLowerCase())) out.push(tag);
  }
  return out.slice(0, 8);
}

/** Only images we host (Vercel Blob) or local dev uploads can be covers. */
function cleanCover(u: string) {
  if (/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(u)) return u;
  if (process.env.NODE_ENV !== "production" && /^(http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)?\/uploads\//.test(u)) return u;
  return "";
}

function autoExcerpt(contentHtml: string) {
  // From the opening paragraphs (not tables, photos or checklists).
  const prose = contentHtml.replace(/<table[\s\S]*?<\/table>|<figure[\s\S]*?<\/figure>|<ul data-type="taskList"[\s\S]*?<\/ul>/g, " ");
  const paras = [...prose.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => htmlToText(m[1])).filter(Boolean);
  let text = "";
  for (const p of paras) {
    text = text ? `${text} ${p}` : p;
    if (text.length > 140) break;
  }
  if (!text) text = htmlToText(contentHtml);
  return text.length > 180 ? `${text.slice(0, 177).replace(/\s+\S*$/, "")}…` : text;
}

async function uniqueSlug(q: Q, wanted: string, id: string | null) {
  const rows = await q<{ slug: string }>(`SELECT slug FROM posts WHERE (slug = $1 OR slug LIKE $1 || '-%') AND id IS DISTINCT FROM $2::uuid`, [wanted, id]);
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(wanted)) return wanted;
  let n = 2;
  while (taken.has(`${wanted}-${n}`)) n++;
  return `${wanted}-${n}`;
}

const REV_KEEP = 30;
const AUTO_EVERY_MIN = 10;

export async function savePost(id: string | null, input: PostInput, by: string): Promise<{ post: Post; before: Post | null }> {
  if (id !== null && !isUuid(id)) throw new PostError("This post no longer exists.", 404);
  return transaction(async (q) => {
    // Lock the row so two saves of the same post can't interleave.
    const [row] = id ? await q<PostRow>(`SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`, [id]) : [];
    const existing = row ? toPost(row) : null;
    if (id && !existing) throw new PostError("This post no longer exists (it may have been moved to the trash).", 404);
    if (existing && input.expectedUpdatedAt && new Date(input.expectedUpdatedAt).getTime() !== new Date(existing.updatedAt).getTime()) {
      const t = new Date(existing.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });
      throw new PostError(
        `${existing.updatedBy} also edited this post (at ${t}). Copy anything you want to keep, then reload the page to see their version.`,
        409,
      );
    }

    const status: PostStatus =
      input.status === "published" || input.status === "scheduled" || input.status === "draft" ? input.status : (existing?.status ?? "draft");
    const contentHtml = cleanPostHtml(typeof input.contentHtml === "string" ? input.contentHtml : (existing?.contentHtml ?? ""));
    const title = input.title !== undefined ? str(input.title, 200) : (existing?.title ?? "");
    const sites = Array.isArray(input.sites) ? [...new Set(input.sites.filter(isSiteId))] : (existing?.sites ?? ["pacific"]);

    let publishAt: string | null =
      input.publishAt !== undefined ? (input.publishAt ? new Date(input.publishAt).toISOString() : null) : (existing?.publishAt ?? null);
    if (publishAt && isNaN(new Date(publishAt).getTime())) throw new PostError("That date doesn't look right.");

    if (status !== "draft") {
      if (!title) throw new PostError("Give your post a title before publishing.");
      if (!sites.length) throw new PostError("Choose at least one website for this post.");
      if (!htmlToText(contentHtml) && !/<img|<iframe|data-type="button"/.test(contentHtml)) throw new PostError("Your post is empty. Write something first!");
    }
    if (status === "published") publishAt = existing && isLive(existing) && existing.publishAt ? existing.publishAt : new Date().toISOString();
    if (status === "scheduled") {
      if (!publishAt) throw new PostError("Pick a date and time for the post to go live.");
      if (new Date(publishAt).getTime() < Date.now() - 60_000) throw new PostError("That time has already passed. Pick a future time, or publish now.");
    }

    const wantedSlug = slugify(input.slug !== undefined && str(input.slug, 100) ? str(input.slug, 100) : existing?.slug || title || "untitled");
    const slug = await uniqueSlug(q, wantedSlug, existing?.id ?? null);
    const excerptIn = input.excerpt !== undefined ? str(input.excerpt, 400) : existing?.excerptAuto ? "" : (existing?.excerpt ?? "");
    const excerpt = excerptIn || autoExcerpt(contentHtml);
    const coverImage = cleanCover(input.coverImage !== undefined ? str(input.coverImage, 1000) : (existing?.coverImage ?? ""));

    const values = [
      slug,
      title,
      excerpt,
      !excerptIn,
      coverImage,
      input.coverAlt !== undefined ? str(input.coverAlt, 300) : (existing?.coverAlt ?? ""),
      contentHtml,
      sites,
      status,
      publishAt,
      input.tags !== undefined ? cleanTags(input.tags) : (existing?.tags ?? []),
      input.featured !== undefined ? Boolean(input.featured) : (existing?.featured ?? false),
      input.seoTitle !== undefined ? str(input.seoTitle, 120) : (existing?.seoTitle ?? ""),
      input.seoDescription !== undefined ? str(input.seoDescription, 320) : (existing?.seoDescription ?? ""),
      by,
    ];

    let saved: PostRow;
    if (existing) {
      [saved] = await q<PostRow>(
        `UPDATE posts SET slug=$1, title=$2, excerpt=$3, excerpt_auto=$4, cover_image=$5, cover_alt=$6, content_html=$7, sites=$8,
           status=$9, publish_at=$10, tags=$11, featured=$12, seo_title=$13, seo_description=$14, updated_by=$15,
           updated_at = greatest(now(), updated_at + interval '1 millisecond')
         WHERE id = $16 RETURNING *`,
        [...values, existing.id],
      );
      // Version history: keep the previous version when something meaningful changed.
      const changed = existing.contentHtml !== contentHtml || existing.title !== title || existing.status !== status || existing.coverImage !== coverImage;
      if (changed) {
        const [last] = await q<{ at: Date }>(`SELECT at FROM post_revisions WHERE post_id = $1 ORDER BY id DESC LIMIT 1`, [existing.id]);
        const due = input.checkpoint || !last || Date.now() - new Date(last.at).getTime() > AUTO_EVERY_MIN * 60_000;
        if (due) {
          await q(
            `INSERT INTO post_revisions (post_id, at, by, status, title, excerpt, cover_image, content_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [existing.id, existing.updatedAt, existing.updatedBy, existing.status, existing.title, existing.excerpt, existing.coverImage, existing.contentHtml],
          );
          await q(
            `DELETE FROM post_revisions WHERE post_id = $1 AND id NOT IN (SELECT id FROM post_revisions WHERE post_id = $1 ORDER BY id DESC LIMIT ${REV_KEEP})`,
            [existing.id],
          );
        }
      }
    } else {
      [saved] = await q<PostRow>(
        `INSERT INTO posts (slug, title, excerpt, excerpt_auto, cover_image, cover_alt, content_html, sites, status, publish_at,
           tags, featured, seo_title, seo_description, updated_by, author)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$15) RETURNING *`,
        values,
      );
    }
    return { post: toPost(saved), before: existing };
  });
}

export async function revisions(id: string): Promise<Revision[]> {
  if (!isUuid(id)) return [];
  const rows = await sql<{ at: Date; by: string; status: PostStatus; title: string; excerpt: string; cover_image: string; content_html: string }>(
    `SELECT at, by, status, title, excerpt, cover_image, content_html FROM post_revisions WHERE post_id = $1 ORDER BY id DESC LIMIT ${REV_KEEP}`,
    [id],
  );
  return rows.map((r) => ({ at: iso(r.at)!, by: r.by, status: r.status, title: r.title, excerpt: r.excerpt, coverImage: r.cover_image, contentHtml: r.content_html }));
}

/** Moves a post to the trash (it disappears from the websites; can be restored for 30 days). */
export async function trashPost(id: string) {
  if (!isUuid(id)) return null;
  const [r] = await sql<PostRow>(`UPDATE posts SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *`, [id]);
  return r ? toPost(r) : null;
}

/** Restores as a draft, so nothing goes back online by surprise. */
export async function restorePost(id: string) {
  if (!isUuid(id)) return null;
  const [r] = await sql<PostRow>(
    `UPDATE posts SET deleted_at = NULL, status = 'draft', publish_at = NULL, updated_at = now() WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *`,
    [id],
  );
  return r ? toPost(r) : null;
}

/** Permanent delete, only from the trash. */
export async function deleteForever(id: string) {
  if (!isUuid(id)) return null;
  const [r] = await sql<PostRow>(`DELETE FROM posts WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *`, [id]);
  return r ? toPost(r) : null;
}

/** Trash older than 30 days is removed for good. */
export async function purgeOldTrash() {
  await sql(`DELETE FROM posts WHERE deleted_at < now() - interval '30 days'`);
}

export async function duplicatePost(id: string, by: string) {
  const p = await getPost(id);
  if (!p) throw new PostError("This post no longer exists.", 404);
  return savePost(null, { ...p, title: `${p.title} (copy)`.slice(0, 200), slug: "", status: "draft", publishAt: null, featured: false }, by);
}

/** Everything, for the "Download a backup" button. */
export async function exportAll() {
  const posts = (await sql<PostRow>(`SELECT * FROM posts ORDER BY created_at`)).map(toPost);
  const revs = await sql(`SELECT post_id, at, by, status, title, excerpt, cover_image, content_html FROM post_revisions ORDER BY post_id, id`);
  return { exportedAt: new Date().toISOString(), version: 1, posts, revisions: revs };
}
