import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { RevealStagger, RevealItem } from "@/components/fx";
import { BookingPanel } from "@/components/affiliate/booking-panel";
import { ExperienceActions } from "@/components/experience/experience-actions";
import { ButtonLink, CategoryPill, MetaPill } from "@/components/ui";
import { getCatalogItem, relatedItems } from "@/lib/catalog";
import { categoryLabel } from "@/lib/categories";

// ponytail: no generateStaticParams here - 879 items would make every build pre-render
// all of them. Dynamic rendering is fine at this scale; add generateStaticParams
// (returning catalogItems ids) as an SEO/perf upgrade if this page needs to be static.
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

function formatLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCatalogItem(slug);
  if (!item) return { title: "Not found" };
  const description =
    item.description ??
    `${item.title} - a ${categoryLabel(item.categoryKey)} experience in the Philippines.`;
  return {
    title: item.title,
    description,
    alternates: { canonical: `/experience/${slug}` },
    openGraph: { title: item.title, description, url: `/experience/${slug}` },
  };
}

export default async function ExperiencePage({ params }: Params) {
  const { slug } = await params;
  const item = await getCatalogItem(slug);
  if (!item) notFound();

  const headline = item.verb && item.subject ? `${item.verb} ${item.subject}` : item.title;
  const location = [item.place, item.province, item.region].filter(Boolean).join(", ");
  const related = await relatedItems(item, 6);

  return (
    <article className="pb-16">
      <div className="container-tara">
        <div className="mx-auto max-w-3xl pt-10">
          <Link
            href="/explore"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-orange"
          >
            <ArrowLeft size={16} /> All experiences
          </Link>

          <div className="rounded-3xl bg-white p-6 sm:p-10">
            <div className="mb-4">
              <CategoryPill categoryKey={item.categoryKey} interactive={false} />
            </div>

            <h1 className="display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              {headline}
            </h1>

            {location && <p className="mt-4 text-lg font-medium text-muted">{location}</p>}

            {(item.costBand || item.duration || item.difficulty) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {item.costBand && <MetaPill>{formatLabel(item.costBand)}</MetaPill>}
                {item.duration && <MetaPill>{formatLabel(item.duration)}</MetaPill>}
                {item.difficulty && <MetaPill>{formatLabel(item.difficulty)}</MetaPill>}
              </div>
            )}

            {item.description && (
              <p className="mt-6 border-l-2 border-orange/40 pl-4 text-lg text-muted text-pretty">
                {item.description}
              </p>
            )}

            {item.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-line pt-6">
              <ExperienceActions
                item={{
                  id: item.id,
                  title: item.title,
                  region: item.region,
                  categoryKey: item.categoryKey,
                }}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/bucket-list" variant="primary">
                Add to a bucket list
              </ButtonLink>
              <ButtonLink href="/blog" variant="outline">
                Read stories
              </ButtonLink>
            </div>
          </div>

          <div className="mt-6">
            <BookingPanel
              context={{
                title: item.title,
                place: item.place,
                province: item.province,
                region: item.region,
                duration: item.duration,
                source: `experience/${item.id}`,
              }}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-tara mt-12">
          <h2 className="mb-8 text-2xl font-extrabold text-ink">Related experiences</h2>
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
            {related.map((r) => {
              const rLocation = [r.place, r.province, r.region].filter(Boolean).join(", ");
              return (
                <RevealItem key={r.id}>
                  <Link
                    href={`/experience/${r.id}`}
                    className="group flex h-full flex-col rounded-3xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <CategoryPill categoryKey={r.categoryKey} interactive={false} />
                    <h3 className="display mt-3 text-lg leading-snug text-ink group-hover:text-orange">
                      {r.title}
                    </h3>
                    {rLocation && <p className="mt-1 text-sm text-muted">{rLocation}</p>}
                  </Link>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </section>
      )}
    </article>
  );
}
