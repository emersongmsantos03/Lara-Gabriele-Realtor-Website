import { NextResponse, type NextRequest } from "next/server";
import { adminApi, err, json, readJson } from "@/lib/admin/http";
import { deleteForever, duplicatePost, getPost, PostError, savePost, trashPost, type PostInput } from "@/lib/admin/posts";
import { isLive } from "@/lib/admin/post-types";
import { revalidateBlog } from "@/lib/admin/revalidate";
import { audit } from "@/lib/admin/security";

type Ctx = RouteContext<"/api/admin/posts/[id]">;

export async function GET(req: NextRequest, ctx: Ctx) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const post = await getPost((await ctx.params).id);
  return post ? json({ post }) : err("Post not found.", 404);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const body = await readJson<PostInput>(req);
  if (!body) return err("That post is too large to save (max 2 MB). Try smaller photos.", 413);
  try {
    const { post, before } = await savePost(id, body, user.name);
    const wasLive = before ? isLive(before) : false;
    const action =
      before?.status !== post.status
        ? post.status === "published"
          ? "post.published"
          : post.status === "scheduled"
            ? "post.scheduled"
            : wasLive
              ? "post.unpublished"
              : "post.updated"
        : "post.updated";
    // Autosaves of drafts are frequent; only log deliberate saves.
    if (body.checkpoint || action !== "post.updated") await audit(action, user, post.title, { id: post.id });
    revalidateBlog(post.slug, before?.slug);
    return json({ post });
  } catch (e) {
    if (e instanceof PostError) return err(e.message, e.status);
    console.error("[posts] update failed", (e as Error).message);
    return err("Couldn't save. Check your connection and try again.", 500);
  }
}

/** POST = duplicate this post as a new draft. */
export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  try {
    const { post } = await duplicatePost((await ctx.params).id, user.name);
    await audit("post.created", user, post.title, { id: post.id, duplicate: true });
    return json({ post });
  } catch (e) {
    return err(e instanceof PostError ? e.message : "Couldn't duplicate the post.", e instanceof PostError ? e.status : 500);
  }
}

/** DELETE = move to trash; DELETE ?forever=1 = remove a trashed post for good. */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const forever = req.nextUrl.searchParams.get("forever") === "1";
  const post = forever ? await deleteForever(id) : await trashPost(id);
  if (!post) return err("Post not found.", 404);
  await audit(forever ? "post.deleted" : "post.trashed", user, post.title, { id });
  revalidateBlog(post.slug);
  return json({ ok: true });
}
