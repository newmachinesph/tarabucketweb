import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { PostCard } from "@/components/post-card";
import { DESTINATIONS, destinationBySlug } from "@/lib/destinations";
import { getPostsByTags } from "@/lib/posts";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) return { title: "Not found" };
  return {
    title: `${d.name}, ${d.region}`,
    description: d.tagline,
    openGraph: { title: d.name, description: d.tagline, images: [d.hero] },
  };
}

export default async function DestinationPage({ params }: Params) {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) notFound();

  const more = DESTINATIONS.filter((x) => x.slug !== slug).slice(0, 3);
  const relatedPosts = await getPostsByTags(d.tags, 3);

  return (
    <article className="pb-8">
      {/* Hero */}
      <div className="relative h-[58vh] min-h-[400px] w-full overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.hero} alt={d.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
        <div className="container-tara absolute inset-x-0 bottom-0 pb-10">
          <p className="kicker text-white/80">{d.region}</p>
          <h1 className="display mt-3 text-6xl text-white sm:text-7xl lg:text-8xl">
            {d.name}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85 text-pretty">
            {d.tagline}
          </p>
        </div>
      </div>

      <div className="container-tara py-12">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-orange"
        >
          <ArrowLeft size={16} /> All destinations
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          {/* Body */}
          <div className="lg:col-span-7">
            <div className="prose-tara">
              {d.blurb.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Gallery */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {d.gallery.map((g, i) => (
                <div
                  key={i}
                  className={`overflow-hidden bg-surface ${i === 0 ? "col-span-2 aspect-[16/10] sm:col-span-2 sm:row-span-2 sm:aspect-auto" : "aspect-square"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g}
                    alt={`${d.name} ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {d.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tag/${t}`}
                  className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-blue/10 hover:text-blue-dark"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>

          {/* Facts sidebar */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-3xl border border-line bg-cream/60 p-7">
                <p className="kicker mb-5 text-blue-dark">Quick facts</p>
                <dl className="divide-y divide-line">
                  {d.facts.map((f) => (
                    <div key={f.label} className="flex justify-between gap-4 py-3">
                      <dt className="text-sm font-semibold text-faint">{f.label}</dt>
                      <dd className="text-right text-sm font-semibold text-ink">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex flex-col gap-2">
                  <ButtonLink href="/bucket-list" variant="primary" className="w-full">
                    Add to a bucket list
                  </ButtonLink>
                  <ButtonLink href="/blog" variant="outline" className="w-full">
                    Read related stories
                  </ButtonLink>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* From the journal (cross-link to posts) */}
      {relatedPosts.length > 0 && (
        <section className="container-tara border-t border-line pt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="display text-3xl text-ink">From the journal</h2>
            <Link href="/blog" className="text-sm font-semibold text-blue-dark hover:text-orange">
              All stories
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* More destinations */}
      <section className="container-tara border-t border-line pt-12">
        <h2 className="display mb-8 text-3xl text-ink">Keep exploring</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {more.map((m) => (
            <Link key={m.slug} href={`/destinations/${m.slug}`} className="group block">
              <div className="aspect-[16/11] overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.hero}
                  alt={m.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="mt-3 block text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                {m.region}
              </span>
              <h3 className="display text-2xl text-ink group-hover:text-blue-dark">
                {m.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
