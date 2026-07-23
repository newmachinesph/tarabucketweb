import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/fx";
import { CatalogGrid } from "@/components/catalog-card";
import { listCatalog, catalogFacets, regionBySlug, slugifyRegion } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type Props = {
  params: Promise<{ region: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug } = await params;
  const region = await regionBySlug(slug);
  if (!region) return { title: "Region not found" };
  return {
    title: `Bucket list: ${region}`,
    description: `Every experience in ${region} — filter the full Philippine bucket-list catalog by place, cost, and vibe.`,
  };
}

export default async function RegionPage({ params, searchParams }: Props) {
  const { region: slug } = await params;
  const region = await regionBySlug(slug);
  if (!region) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);

  const [{ items, total }, facets] = await Promise.all([
    listCatalog({ region, page, pageSize: PAGE_SIZE }),
    catalogFacets(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-tara py-14">
      <Reveal>
        <header className="mb-10 max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">By region</p>
          <h1 className="display text-6xl text-ink sm:text-7xl">
            {region}
          </h1>
          <p className="mt-5 text-lg text-muted">
            {total} {total === 1 ? "experience" : "experiences"} to tick off in {region}.
          </p>
        </header>
      </Reveal>

      <nav className="mb-10 flex flex-wrap gap-2">
        {facets.regions.map((r) => (
          <Link
            key={r.region}
            href={`/explore/region/${slugifyRegion(r.region)}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              r.region === region
                ? "border-transparent bg-ink text-white"
                : "border-line text-ink hover:border-ink/30"
            }`}
          >
            {r.region} <span className="text-faint">{r.count}</span>
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="text-muted">No experiences here yet.</p>
      ) : (
        <>
          <CatalogGrid items={items} />
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
              {page > 1 ? (
                <Link
                  href={`/explore/region/${slug}?page=${page - 1}`}
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
                  href={`/explore/region/${slug}?page=${page + 1}`}
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
        <Link href="/explore" className="text-sm font-semibold text-orange hover:underline">
          &larr; Back to all experiences
        </Link>
      </div>
    </div>
  );
}
