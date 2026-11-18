import { requireAdmin } from "@/lib/admin/auth";
import { allPosts, trashedPosts } from "@/lib/admin/posts";
import { allTimePostTotals } from "@/lib/admin/analytics";
import PostsList from "../../_components/PostsList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog posts" };

export default async function PostsPage(props: PageProps<"/admin/posts">) {
  await requireAdmin();
  const { tab } = await props.searchParams;
  const [posts, trash, totals] = await Promise.all([allPosts(), trashedPosts(), allTimePostTotals().catch(() => ({}))]);
  const views = Object.fromEntries(Object.entries(totals).map(([slug, t]) => [slug, t.views]));
  return <PostsList initialPosts={posts} initialTab={typeof tab === "string" ? tab : "all"} views={views} initialTrash={trash} />;
}
