import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { POSTS_TAG } from "./posts";

/** Refresh the cached post list and the main site's blog pages right after a change. */
export function revalidateBlog(...slugs: (string | undefined)[]) {
  // expire: 0 → the very next visitor gets fresh data (no stale copy).
  revalidateTag(POSTS_TAG, { expire: 0 });
  revalidatePath("/blog");
  for (const s of new Set(slugs.filter(Boolean))) revalidatePath(`/blog/${s}`);
  revalidatePath("/sitemap.xml");
}
