import Link from "next/link";
import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { Reveal, RevealStagger, RevealItem } from "@/components/fx";
import { CATEGORIES } from "@/lib/categories";
import { getPublishedPosts, getCategoryCounts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Read",
  description:
    "Guides, deep-dives, and stories for your Philippine bucket list.",
};

export default async function BlogPage() {
  const [posts, counts] = await Promise.all([
    getPublishedPosts(),
    getCategoryCounts(),
  ]);
  const total = posts.length;

  return (
    <div className="container-tara py-12">
      <Reveal>
        <header className="mb-12 max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">The journal</p>
          <h1 className="display text-6xl text-ink sm:text-7xl">
            Every story <span className="display-italic text-orange">on the list</span>
          </h1>
          <p className="mt-5 text-lg text-muted">
            {total} {total === 1 ? "story" : "stories"} across islands, food,
            festivals, and everything worth chasing.
          </p>
        </header>
      </Reveal>

      <div className="mb-10 flex flex-wrap gap-2">
        <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
          All
        </span>
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/category/${c.key}`}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-transparent"
            style={{ backgroundColor: "transparent" }}
          >
            {c.emoji} {c.label}
            <span className="ml-1.5 text-faint">{counts[c.key] ?? 0}</span>
          </Link>
        ))}
      </div>

      {total > 0 ? (
        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
          {posts.map((post) => (
            <RevealItem key={post.id}>
              <PostCard post={post} />
            </RevealItem>
          ))}
        </RevealStagger>
      ) : (
        <p className="text-muted">No stories published yet.</p>
      )}
    </div>
  );
}
