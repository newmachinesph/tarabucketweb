import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import { categoryByKey } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import type { PostWithAuthor } from "@/lib/posts";

export function PostCard({
  post,
  size = "default",
}: {
  post: PostWithAuthor;
  size?: "default" | "large";
}) {
  const cat = categoryByKey(post.category);
  const large = size === "large";
  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className={`relative block overflow-hidden bg-surface ${large ? "aspect-[16/10]" : "aspect-[3/2]"}`}
      >
        {post.coverImage ? (
          // alt="" on purpose: the card's heading is the link text, so describing the photo
          // here would just make screen readers announce the same story twice.
          <CoverImage
            src={post.coverImage}
            alt=""
            sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 640px) 33vw, 100vw"}
            className="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-6xl"
            style={{ backgroundColor: `${cat?.color ?? "#14A3E1"}12` }}
          >
            {cat?.emoji ?? "🪣"}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: cat?.color ?? "#14A3E1" }}
        >
          {cat?.label ?? post.category}
        </span>
        <h3
          className={`mt-2 font-serif font-bold leading-[1.12] text-ink ${large ? "text-3xl" : "text-xl"}`}
        >
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-blue-dark">
            {post.title}
          </Link>
        </h3>
        <p className={`mt-2 flex-1 text-muted ${large ? "text-base" : "text-sm"} line-clamp-2`}>
          {post.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-faint">
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </article>
  );
}
