import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { CoverImage } from "@/components/cover-image";
import { PostCard } from "@/components/post-card";
import { CategoryPill } from "@/components/ui";
import { NewsletterForm } from "@/components/newsletter-form";
import { formatDate } from "@/lib/format";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
      // Left unset when there's no cover so the generated card in
      // `opengraph-image.tsx` takes over instead of the site default.
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.authorName ?? SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url.replace(/\/$/, "")}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Cover */}
      {post.coverImage && (
        <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden bg-surface">
          <CoverImage src={post.coverImage} alt={post.title} sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
        </div>
      )}

      <div className="container-tara">
        <div className="mx-auto max-w-3xl">
          <div className={post.coverImage ? "-mt-16 relative" : "pt-10"}>
            <div className="rounded-3xl bg-white p-6 sm:p-10">
              <Link
                href="/blog"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-orange"
              >
                <ArrowLeft size={16} /> All stories
              </Link>

              <div className="mb-4">
                <CategoryPill categoryKey={post.category} />
              </div>

              <h1 className="display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-muted">
                {post.authorName && <span>By {post.authorName}</span>}
                <span aria-hidden>·</span>
                <span>{formatDate(post.publishedAt)}</span>
                <span aria-hidden>·</span>
                <span>{post.readingMinutes} min read</span>
              </div>

              {post.excerpt && (
                <p className="mt-6 border-l-2 border-orange/40 pl-4 text-lg font-medium text-muted">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-1 py-8 sm:px-10">
            <Markdown>{post.content}</Markdown>

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-blue/10 hover:text-blue-dark"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Inline newsletter */}
          <div className="my-8 rounded-3xl bg-cream p-8 text-center">
            <h2 className="text-xl font-extrabold text-ink">
              Liked this? Get one every week.
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Join the weekly bucket - one Philippine adventure in your inbox.
            </p>
            <div className="mx-auto mt-5 max-w-md">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-tara mt-8">
          <h2 className="mb-8 text-2xl font-extrabold text-ink">
            More {post.category} stories
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
