import { NextResponse, type NextRequest } from "next/server";
import { adminApi, err, json, readJson } from "@/lib/admin/http";
import { allPosts, PostError, savePost, trashedPosts, type PostInput } from "@/lib/admin/posts";
import { revalidateBlog } from "@/lib/admin/revalidate";
import { audit } from "@/lib/admin/security";

export async function GET(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const trash = req.nextUrl.searchParams.get("trash") === "1";
  return json({ posts: trash ? await trashedPosts() : await allPosts() });
}

export async function POST(req: NextRequest) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const body = await readJson<PostInput>(req);
  if (!body) return err("That post is too large to save (max 2 MB). Try smaller photos.", 413);
  try {
    const { post } = await savePost(null, body, user.name);
    await audit(post.status === "draft" ? "post.created" : post.status === "scheduled" ? "post.scheduled" : "post.published", user, post.title, { id: post.id });
    revalidateBlog(post.slug);
    return json({ post });
  } catch (e) {
    if (e instanceof PostError) return err(e.message, e.status);
    console.error("[posts] create failed", (e as Error).message);
    return err("Couldn't save. Check your connection and try again.", 500);
  }
}
