import { NextResponse, type NextRequest } from "next/server";
import { adminApi, err, json } from "@/lib/admin/http";
import { restorePost } from "@/lib/admin/posts";
import { audit } from "@/lib/admin/security";

/** Takes a post out of the trash (as a draft). */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/posts/[id]/restore">) {
  const user = await adminApi(req);
  if (user instanceof NextResponse) return user;
  const post = await restorePost((await ctx.params).id);
  if (!post) return err("Post not found in the trash.", 404);
  await audit("post.restored", user, post.title, { id: post.id });
  return json({ post });
}
