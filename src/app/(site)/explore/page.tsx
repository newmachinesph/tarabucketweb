import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Reveal } from "@/components/fx";
import { CatalogGrid } from "@/components/catalog-card";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import {
  listCatalog,
  catalogFacets,
  subcategoryFacets,
  COST_BANDS,
  DURATIONS,
  DIFFICULTIES,
} from "@/lib/catalog";

export const revalidate = 300;

const PAGE_SIZE = 24;
// Subcategory lists run long (culture has 60+ even after canonicalization) — show the
// head of the distribution; an active selection outside it is appended so it stays visible.
const MAX_SUBCATEGORIES = 14;

type Filters = {
  category?: string;
  subcategory?: string;
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
      subcategory: firstParam(sp.subcategory),
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
  // Changing category invalidates the subcategory (they're per-category values).
  const overrides: Partial<Filters> =
    key === "category" ? { category: value, subcategory: undefined } : { [key]: value };
  return toQueryString(filters, overrides);
}

function pageHref(filters: Filters, page: number): string {
  return toQueryString(filters, { page });
}

function formatLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Filter panel building blocks (server-rendered, no JS) ─────────

function FacetGroup({
  label,
  defaultOpen,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-line py-3.5 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-faint transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function FacetLink({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count?: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
        active ? "bg-ink font-semibold text-white" : "text-ink/80 hover:bg-ink/5"
      }`}
    >
      <span className="min-w-0 truncate">{children}</span>
      {count !== undefined && (
        <span className={`shrink-0 text-xs ${active ? "text-white/70" : "text-faint"}`}>
          {count}
        </span>
      )}
    </Link>
  );
}

function FacetChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors ${
        active ? "border-transparent bg-ink text-white" : "border-line text-ink hover:border-ink/30"
      }`}
    >
      {children}
    </Link>
  );
}

function FilterPanel({
  filters,
  facets,
  subs,
}: {
  filters: Filters;
  facets: { regions: { region: string; count: number }[]; categories: Record<string, number> };
  subs: { subcategory: string; count: number }[];
}) {
  // Head of the subcategory distribution, with the active value pinned in.
  let visibleSubs = subs.slice(0, MAX_SUBCATEGORIES);
  if (
    filters.subcategory &&
    !visibleSubs.some((s) => s.subcategory === filters.subcategory)
  ) {
    const current = subs.find((s) => s.subcategory === filters.subcategory);
    if (current) visibleSubs = [...visibleSubs, current];
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      {/* Plain GET form — hidden inputs carry active filters so search doesn't reset them. */}
      <form action="/explore" method="get" className="mb-1 flex gap-1.5">
        {Object.entries(filters).map(([k, v]) =>
          k !== "q" && v ? <input key={k} type="hidden" name={k} value={v} /> : null,
        )}
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search experiences..."
          className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-2 text-sm text-ink placeholder:text-faint focus:border-orange focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange"
          aria-label="Search"
        >
          Go
        </button>
      </form>

      <FacetGroup label="Category" defaultOpen>
        <div className="space-y-0.5">
          <FacetLink href={chipHref(filters, "category", undefined)} active={!filters.category}>
            All categories
          </FacetLink>
          {CATEGORIES.map((c) => (
            <FacetLink
              key={c.key}
              href={chipHref(filters, "category", c.key)}
              active={filters.category === c.key}
              count={facets.categories[c.key] ?? 0}
            >
              {c.emoji} {c.label}
            </FacetLink>
          ))}
        </div>
      </FacetGroup>

      {filters.category && subs.length > 0 && (
        <FacetGroup label="Type" defaultOpen>
          <div className="space-y-0.5">
            <FacetLink
              href={chipHref(filters, "subcategory", undefined)}
              active={!filters.subcategory}
            >
              All types
            </FacetLink>
            {visibleSubs.map((s) => (
              <FacetLink
                key={s.subcategory}
                href={chipHref(filters, "subcategory", s.subcategory)}
                active={filters.subcategory === s.subcategory}
                count={s.count}
              >
                {s.subcategory}
              </FacetLink>
            ))}
          </div>
        </FacetGroup>
      )}

      {facets.regions.length > 0 && (
        <FacetGroup label="Region" defaultOpen={Boolean(filters.region)}>
          <div className="space-y-0.5">
            <FacetLink href={chipHref(filters, "region", undefined)} active={!filters.region}>
              All regions
            </FacetLink>
            {facets.regions.map((r) => (
              <FacetLink
                key={r.region}
                href={chipHref(filters, "region", r.region)}
                active={filters.region === r.region}
                count={r.count}
              >
                {r.region}
              </FacetLink>
            ))}
          </div>
        </FacetGroup>
      )}

      <FacetGroup label="Cost" defaultOpen={Boolean(filters.cost)}>
        <div className="flex flex-wrap gap-1.5">
          {COST_BANDS.map((c) => (
            <FacetChip
              key={c}
              href={chipHref(filters, "cost", filters.cost === c ? undefined : c)}
              active={filters.cost === c}
            >
              {formatLabel(c)}
            </FacetChip>
          ))}
        </div>
      </FacetGroup>

      <FacetGroup label="Duration" defaultOpen={Boolean(filters.duration)}>
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map((d) => (
            <FacetChip
              key={d}
              href={chipHref(filters, "duration", filters.duration === d ? undefined : d)}
              active={filters.duration === d}
            >
              {formatLabel(d)}
            </FacetChip>
          ))}
        </div>
      </FacetGroup>

      <FacetGroup label="Difficulty" defaultOpen={Boolean(filters.difficulty)}>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((d) => (
            <FacetChip
              key={d}
              href={chipHref(filters, "difficulty", filters.difficulty === d ? undefined : d)}
              active={filters.difficulty === d}
            >
              {formatLabel(d)}
            </FacetChip>
          ))}
        </div>
      </FacetGroup>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { filters } = await readFilters(searchParams);
  let title = "Explore";
  if (filters.subcategory) title = `${filters.subcategory} experiences`;
  else if (filters.category) title = `${categoryLabel(filters.category)} experiences`;
  else if (filters.region) title = `Experiences in ${filters.region}`;
  // Six filter dimensions multiply into a very large number of URLs that all serve slices
  // of one catalog. Every one canonicalises to the base page, and filtered views are left
  // out of the index entirely — they're duplicate content, and letting a crawler spend its
  // budget enumerating combinations starves the pages that should rank.
  // `follow` stays on so the crawler still reaches every experience through these links.
  const isFiltered = Object.values(filters).some(Boolean);

  return {
    title,
    description:
      "Every experience in the Philippine bucket-list catalog — filter by category, type, region, cost, duration, or difficulty.",
    alternates: { canonical: "/explore" },
    ...(isFiltered ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ExplorePage({ searchParams }: Props) {
  const { filters, page } = await readFilters(searchParams);

  const [{ items, total }, facets, subs] = await Promise.all([
    listCatalog({ ...filters, page, pageSize: PAGE_SIZE }),
    catalogFacets(),
    filters.category ? subcategoryFacets(filters.category) : Promise.resolve([]),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // One pill per active filter; each pill's href removes just that filter.
  const pills: { key: string; label: string; href: string }[] = [];
  if (filters.category)
    pills.push({
      key: "category",
      label: categoryLabel(filters.category),
      href: chipHref(filters, "category", undefined),
    });
  if (filters.subcategory)
    pills.push({
      key: "subcategory",
      label: filters.subcategory,
      href: chipHref(filters, "subcategory", undefined),
    });
  if (filters.region)
    pills.push({ key: "region", label: filters.region, href: chipHref(filters, "region", undefined) });
  if (filters.cost)
    pills.push({ key: "cost", label: formatLabel(filters.cost), href: chipHref(filters, "cost", undefined) });
  if (filters.duration)
    pills.push({
      key: "duration",
      label: formatLabel(filters.duration),
      href: chipHref(filters, "duration", undefined),
    });
  if (filters.difficulty)
    pills.push({
      key: "difficulty",
      label: formatLabel(filters.difficulty),
      href: chipHref(filters, "difficulty", undefined),
    });
  if (filters.q)
    pills.push({ key: "q", label: `“${filters.q}”`, href: chipHref(filters, "q", undefined) });

  return (
    <div className="container-tara py-10 lg:py-14">
      <Reveal>
        <header className="mb-8 max-w-3xl">
          <p className="kicker mb-3 text-orange">The full list</p>
          <h1 className="display text-4xl text-ink sm:text-5xl">
            Explore every <span className="display-italic text-orange">experience</span>
          </h1>
          <p className="mt-3 text-muted">
            Filter the archipelago by category, type, place, cost, or vibe — or{" "}
            <Link href="/collections" className="font-semibold text-orange hover:underline">
              browse curated collections
            </Link>
            .
          </p>
        </header>
      </Reveal>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-10">
        {/* Mobile: filters fold away behind one toggle instead of eating the screen. */}
        <details className="group mb-6 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={16} />
              Filters{pills.length > 0 && ` (${pills.length})`}
            </span>
            <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3">
            <FilterPanel filters={filters} facets={facets} subs={subs} />
          </div>
        </details>

        {/* Desktop: persistent sidebar. */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <FilterPanel filters={filters} facets={facets} subs={subs} />
        </aside>

        <section>
          <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-line pb-5">
            <p className="mr-2 text-sm font-semibold text-ink">
              {total} {total === 1 ? "experience" : "experiences"}
            </p>
            {pills.map((p) => (
              <Link
                key={p.key}
                href={p.href}
                className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[13px] font-semibold text-white transition-colors hover:bg-orange"
              >
                {p.label}
                <X size={12} aria-hidden />
                <span className="sr-only">Remove {p.key} filter</span>
              </Link>
            ))}
            {pills.length > 0 && (
              <Link
                href="/explore"
                className="text-[13px] font-semibold text-muted hover:text-orange"
              >
                Clear all
              </Link>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line py-20 text-center">
              <p className="text-lg font-semibold text-ink">No experiences match those filters.</p>
              <Link
                href="/explore"
                className="mt-3 inline-block text-sm font-semibold text-orange hover:underline"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <>
              <CatalogGrid items={items} />

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
                  {page > 1 ? (
                    <Link
                      href={pageHref(filters, page - 1)}
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
                      href={pageHref(filters, page + 1)}
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
        </section>
      </div>
    </div>
  );
}
