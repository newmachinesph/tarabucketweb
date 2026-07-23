import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { CatalogGrid } from "@/components/catalog-card";
import { getPublishedPosts } from "@/lib/posts";
import { listByTag } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `Stories tagged #${decoded} on Tara Bucket.`,
  };
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const [posts, { items: experiences, total: experienceTotal }] = await Promise.all([
    getPublishedPosts({ tag: decoded }),
    listByTag(decoded),
  ]);

  return (
    <div className="container-tara py-12">
      <header className="mb-10">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-orange">
          Tagged
        </p>
        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
          #{decoded}
        </h1>
        <p className="mt-3 text-lg text-muted">
          {posts.length} {posts.length === 1 ? "story" : "stories"}
          {experienceTotal > 0 &&
            ` · ${experienceTotal} ${experienceTotal === 1 ? "experience" : "experiences"}`}{" "}
          tagged #{decoded}.
        </p>
      </header>

      {experiences.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-extrabold text-ink">Experiences</h2>
          <CatalogGrid items={experiences} />
        </section>
      )}

      <section>
        {posts.length > 0 ? (
          <>
            <h2 className="mb-6 text-2xl font-extrabold text-ink">Stories</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        ) : (
          experiences.length === 0 && (
            <p className="text-muted">Nothing tagged #{decoded} yet.</p>
          )
        )}
      </section>
    </div>
  );
}
