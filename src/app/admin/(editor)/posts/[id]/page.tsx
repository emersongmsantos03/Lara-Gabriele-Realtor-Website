import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { allPosts } from "@/lib/admin/posts";
import { isLive } from "@/lib/admin/post-types";
import { SITES } from "@/lib/admin/sites";
import PostEditor from "../../../_components/editor/PostEditor";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/admin/posts/[id]">) {
  const { id } = await props.params;
  return { title: id === "new" ? "New post" : "Edit post" };
}

export default async function EditPostPage(props: PageProps<"/admin/posts/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const posts = await allPosts();
  const post = id === "new" ? null : (posts.find((p) => p.id === id) ?? null);
  if (id !== "new" && !post) notFound();

  // Other live posts, offered when adding links and buttons.
  const linkTargets = posts
    .filter((p) => p.id !== post?.id && isLive(p) && p.sites.length)
    .map((p) => ({ title: p.title, url: SITES[p.sites.includes("pacific") ? "pacific" : p.sites[0]].postUrl(p.slug) }));
  const count = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) count.set(t, (count.get(t) ?? 0) + 1);
  const allTags = [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);

  // key: a fresh editor when switching between posts.
  return <PostEditor key={post?.id ?? "new"} initial={post} linkTargets={linkTargets} allTags={allTags} />;
}
