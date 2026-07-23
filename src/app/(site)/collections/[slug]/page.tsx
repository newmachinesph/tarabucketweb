import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/fx";
import { CatalogGrid } from "@/components/catalog-card";
import { listCatalog } from "@/lib/catalog";
import { collectionBySlug } from "@/lib/collections";

export const revalidate = 300;

const PAGE_SIZE = 24;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = collectionBySlug(slug);
  if (!collection) return { title: "Collection not found" };
  return { title: collection.title, description: collection.blurb };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const collection = collectionBySlug(slug);
  if (!collection) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);

  const { items, total } = await listCatalog({
    ...collection.filters,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-tara py-14">
      <Reveal>
        <header className="mb-10 max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">Collection</p>
          <h1 className="display text-6xl text-ink sm:text-7xl">
            <span className="mr-3">{collection.emoji}</span>
            {collection.title}
          </h1>
          <p className="mt-5 text-lg text-muted">{collection.blurb}</p>
          <p className="mt-2 text-sm font-semibold text-faint">
            {total} {total === 1 ? "experience" : "experiences"}
          </p>
        </header>
      </Reveal>

      {items.length === 0 ? (
        <p className="text-muted">Nothing in this collection yet.</p>
      ) : (
        <>
          <CatalogGrid items={items} />
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
              {page > 1 ? (
                <Link
                  href={`/collections/${slug}?page=${page - 1}`}
                  className="text-sm font-semibold text-ink hover:text-orange"
                >
                  &larr; Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/collections/${slug}?page=${page + 1}`}
                  className="text-sm font-semibold text-ink hover:text-orange"
                >
                  Next &rarr;
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-12 border-t border-line pt-6">
        <Link href="/collections" className="text-sm font-semibold text-orange hover:underline">
          &larr; All collections
        </Link>
      </div>
    </div>
  );
}
