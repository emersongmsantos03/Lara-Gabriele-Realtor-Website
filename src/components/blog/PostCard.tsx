import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/admin/post-types";
import { formatPostDate, imageSrc } from "@/lib/admin/post-types";
import { readingMinutes } from "@/lib/admin/posts";

export function CoverFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-ink via-[#163f5c] to-sea flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-mark.png" alt="" className="w-16 opacity-25 brightness-0 invert" />
    </div>
  );
}

export default function PostCard({ post, priority }: { post: Post; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-cream-deep">
        {post.coverImage ? (
          <Image
            src={imageSrc(post.coverImage)}
            alt={post.coverAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <CoverFallback />
        )}
        {post.tags[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            {post.tags[0]}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-xl leading-snug group-hover:text-gold transition-colors text-balance">{post.title}</h3>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-3">{post.excerpt}</p>
      <p className="mt-3 text-xs text-ink-soft/80">
        {formatPostDate(post.publishAt)} &middot; {readingMinutes(post.contentHtml)} min read
      </p>
    </Link>
  );
}
