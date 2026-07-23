import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { RevealStagger, RevealItem } from "@/components/fx";
import { CATEGORIES, categoryByKey } from "@/lib/categories";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 300;

type Params = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { key } = await params;
  const cat = categoryByKey(key);
  if (!cat) return { title: "Not found" };
  return { title: cat.label, description: cat.blurb };
}

export default async function CategoryPage({ params }: Params) {
  const { key } = await params;
  const cat = categoryByKey(key);
  if (!cat) notFound();

  const posts = await getPublishedPosts({ category: cat.key });

  return (
    <div className="container-tara py-12">
      <header
        className="mb-10 overflow-hidden rounded-[2rem] p-8 sm:p-12"
        style={{ backgroundColor: `${cat.color}12` }}
      >
        <span className="text-5xl">{cat.emoji}</span>
        <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">
          {cat.label}
        </h1>
        <p className="mt-1 text-lg font-semibold" style={{ color: cat.color }}>
          {cat.tagalog}
        </p>
        <p className="mt-3 max-w-xl text-muted">{cat.blurb}</p>
      </header>

      <nav className="mb-10 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/category/${c.key}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              c.key === cat.key
                ? "text-white"
                : "border border-line text-ink hover:bg-surface"
            }`}
            style={c.key === cat.key ? { backgroundColor: cat.color } : undefined}
          >
            {c.emoji} {c.label}
          </Link>
        ))}
      </nav>

      {posts.length > 0 ? (
        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
          {posts.map((post) => (
            <RevealItem key={post.id}>
              <PostCard post={post} />
            </RevealItem>
          ))}
        </RevealStagger>
      ) : (
        <p className="text-muted">
          No {cat.label.toLowerCase()} stories yet - check back soon.
        </p>
      )}
    </div>
  );
}
