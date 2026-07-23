import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Reveal } from "@/components/fx";
import { CatalogGrid } from "@/components/catalog-card";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import {
  listCatalog,
  catalogFacets,
  COST_BANDS,
  DURATIONS,
  DIFFICULTIES,
} from "@/lib/catalog";

export const revalidate = 300;

const PAGE_SIZE = 24;

type Filters = {
  category?: string;
  region?: string;
  cost?: string;
  duration?: string;
  difficulty?: string;
  q?: string;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Props = { searchParams: SearchParams };

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function readFilters(searchParams: SearchParams): Promise<{ filters: Filters; page: number }> {
  const sp = await searchParams;
  return {
    filters: {
      category: firstParam(sp.category),
      region: firstParam(sp.region),
      cost: firstParam(sp.cost),
      duration: firstParam(sp.duration),
      difficulty: firstParam(sp.difficulty),
      q: firstParam(sp.q),
    },
    page: Math.max(1, Number(firstParam(sp.page)) || 1),
  };
}

function toQueryString(filters: Filters, overrides: Partial<Filters & { page: number }>): string {
  const merged: Record<string, string> = {};
  const source: Record<string, string | number | undefined> = { ...filters, ...overrides };
  for (const [k, v] of Object.entries(source)) {
    if (v === undefined || v === "") continue;
    if (k === "page" && v === 1) continue;
    merged[k] = String(v);
  }
  const qs = new URLSearchParams(merged).toString();
  return qs ? `/explore?${qs}` : "/explore";
}

function chipHref(filters: Filters, key: keyof Filters, value: string | undefined): string {
  return toQueryString(filters, { [key]: value } as Partial<Filters>);
}

function pageHref(filters: Filters, page: number): string {
  return toQueryString(filters, { page });
}

function formatLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-faint">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-transparent bg-ink text-white"
          : "border-line text-ink hover:border-ink/30"
      }`}
    >
      {children}
    </Link>
  );
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { filters } = await readFilters(searchParams);
  let title = "Explore";
  if (filters.category) title = `${categoryLabel(filters.category)} experiences`;
  else if (filters.region) title = `Experiences in ${filters.region}`;
  return {
    title,
    description:
      "Every experience in the Philippine bucket-list catalog — filter by category, region, cost, duration, or difficulty.",
  };
}

export default async function ExplorePage({ searchParams }: Props) {
  const { filters, page } = await readFilters(searchParams);

  const [{ items, total }, facets] = await Promise.all([
    listCatalog({ ...filters, page, pageSize: PAGE_SIZE }),
    catalogFacets(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="container-tara py-14">
      <Reveal>
        <header className="mb-10 max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">The full list</p>
          <h1 className="display text-6xl text-ink sm:text-7xl">
            Explore every <span className="display-italic text-orange">experience</span>
          </h1>
          <p className="mt-5 text-lg text-muted">
            {total} {total === 1 ? "experience" : "experiences"} across the archipelago
            &mdash; filter by category, place, cost, or vibe.
          </p>
          <p className="mt-4 text-sm font-semibold">
            <Link href="/collections" className="text-orange hover:underline">
              Browse curated collections &rarr;
            </Link>
          </p>
        </header>
      </Reveal>

      <div className="mb-10 rounded-3xl border border-line bg-cream/40 p-6">
        <ChipRow label="Category">
          <Chip href={chipHref(filters, "category", undefined)} active={!filters.category}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              href={chipHref(filters, "category", c.key)}
              active={filters.category === c.key}
            >
              {c.emoji} {c.label} <span className="text-faint">{facets.categories[c.key] ?? 0}</span>
            </Chip>
          ))}
        </ChipRow>

        {facets.regions.length > 0 && (
          <ChipRow label="Region">
            <Chip href={chipHref(filters, "region", undefined)} active={!filters.region}>
              All
            </Chip>
            {facets.regions.map((r) => (
              <Chip
                key={r.region}
                href={chipHref(filters, "region", r.region)}
                active={filters.region === r.region}
              >
                {r.region} <span className="text-faint">{r.count}</span>
              </Chip>
            ))}
          </ChipRow>
        )}

        <ChipRow label="Cost">
          <Chip href={chipHref(filters, "cost", undefined)} active={!filters.cost}>
            All
          </Chip>
          {COST_BANDS.map((c) => (
            <Chip key={c} href={chipHref(filters, "cost", c)} active={filters.cost === c}>
              {formatLabel(c)}
            </Chip>
          ))}
        </ChipRow>

        <ChipRow label="Duration">
          <Chip href={chipHref(filters, "duration", undefined)} active={!filters.duration}>
            All
          </Chip>
          {DURATIONS.map((d) => (
            <Chip key={d} href={chipHref(filters, "duration", d)} active={filters.duration === d}>
              {formatLabel(d)}
            </Chip>
          ))}
        </ChipRow>

        <ChipRow label="Difficulty">
          <Chip href={chipHref(filters, "difficulty", undefined)} active={!filters.difficulty}>
            All
          </Chip>
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              href={chipHref(filters, "difficulty", d)}
              active={filters.difficulty === d}
            >
              {formatLabel(d)}
            </Chip>
          ))}
        </ChipRow>

        {/* Plain GET form - no client JS needed. Hidden inputs carry the active
            chip filters forward so a search doesn't reset them. */}
        <form action="/explore" method="get" className="mt-2 flex flex-wrap gap-2 border-t border-line pt-5">
          {filters.category && <input type="hidden" name="category" value={filters.category} />}
          {filters.region && <input type="hidden" name="region" value={filters.region} />}
          {filters.cost && <input type="hidden" name="cost" value={filters.cost} />}
          {filters.duration && <input type="hidden" name="duration" value={filters.duration} />}
          {filters.difficulty && <input type="hidden" name="difficulty" value={filters.difficulty} />}
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search experiences, places, descriptions..."
            className="min-w-0 flex-1 rounded-full border border-line bg-white px-5 py-2.5 text-sm text-ink placeholder:text-faint focus:border-orange focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange"
          >
            Search
          </button>
          {hasFilters && (
            <Link
              href="/explore"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted hover:text-orange"
            >
              Clear all
            </Link>
          )}
        </form>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line py-20 text-center">
          <p className="text-lg font-semibold text-ink">No experiences match those filters.</p>
          <Link href="/explore" className="mt-3 inline-block text-sm font-semibold text-orange hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <CatalogGrid items={items} />

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
              {page > 1 ? (
                <Link href={pageHref(filters, page - 1)} className="text-sm font-semibold text-ink hover:text-orange">
                  &larr; Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(filters, page + 1)} className="text-sm font-semibold text-ink hover:text-orange">
                  Next &rarr;
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
