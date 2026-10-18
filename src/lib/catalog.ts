import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { catalogItems, type CatalogItem } from "@/db/schema";

export const COST_BANDS = ["free", "budget", "mid", "splurge", "luxury"] as const;
export const DURATIONS = ["hours", "half-day", "day", "weekend", "multi-day"] as const;
export const DIFFICULTIES = ["easy", "moderate", "hard"] as const;

export type CatalogFilters = {
  category?: string;
  subcategory?: string;
  region?: string;
  province?: string;
  cost?: string;
  duration?: string;
  difficulty?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

const inSet = (set: readonly string[], v: string | undefined): v is string =>
  !!v && set.includes(v);

function buildWhere(filters: CatalogFilters) {
  const conditions = [];
  // Fixed-enum filters are whitelisted so a bogus URL value is ignored rather than
  // silently matching nothing. region/province are data-driven, so they pass through
  // (still parameterized — no injection risk).
  if (filters.category) conditions.push(eq(catalogItems.categoryKey, filters.category));
  if (filters.subcategory) conditions.push(eq(catalogItems.subcategory, filters.subcategory));
  if (filters.region) conditions.push(eq(catalogItems.region, filters.region));
  if (filters.province) conditions.push(eq(catalogItems.province, filters.province));
  if (inSet(COST_BANDS, filters.cost)) conditions.push(eq(catalogItems.costBand, filters.cost));
  if (inSet(DURATIONS, filters.duration)) conditions.push(eq(catalogItems.duration, filters.duration));
  if (inSet(DIFFICULTIES, filters.difficulty))
    conditions.push(eq(catalogItems.difficulty, filters.difficulty));
  if (filters.q) {
    const term = `%${filters.q}%`;
    // ponytail: ILIKE over 3 text columns is instant at 879 rows; add a tsvector/GIN
    // index (or pg_trgm) if the catalog ever grows past a few thousand rows.
    conditions.push(
      or(
        ilike(catalogItems.title, term),
        ilike(catalogItems.description, term),
        ilike(catalogItems.place, term),
      ),
    );
  }
  return conditions.length ? and(...conditions) : undefined;
}

export async function listCatalog(
  filters: CatalogFilters = {},
): Promise<{ items: CatalogItem[]; total: number }> {
  const where = buildWhere(filters);
  const pageSize = filters.pageSize ?? 24;
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * pageSize;

  const [items, countRows] = await Promise.all([
    db
      .select()
      .from(catalogItems)
      .where(where)
      .orderBy(asc(catalogItems.title))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(catalogItems)
      .where(where),
  ]);

  return { items, total: countRows[0]?.count ?? 0 };
}

// Memoized per-request (page + generateMetadata resolve the same id).
export const getCatalogItem = cache(
  async (id: string): Promise<CatalogItem | null> => {
    const [row] = await db.select().from(catalogItems).where(eq(catalogItems.id, id)).limit(1);
    return row ?? null;
  },
);

export async function relatedItems(item: CatalogItem, limit = 6): Promise<CatalogItem[]> {
  const sameProvince = item.province
    ? await db
        .select()
        .from(catalogItems)
        .where(and(eq(catalogItems.province, item.province), ne(catalogItems.id, item.id)))
        .orderBy(asc(catalogItems.title))
        .limit(limit)
    : [];
  if (sameProvince.length >= limit) return sameProvince;

  // Backfill with same-category items when the province doesn't have enough (mirrors
  // the getFeaturedPosts backfill pattern in lib/posts.ts).
  const seen = new Set(sameProvince.map((i) => i.id));
  const sameCategory = await db
    .select()
    .from(catalogItems)
    .where(and(eq(catalogItems.categoryKey, item.categoryKey), ne(catalogItems.id, item.id)))
    .orderBy(asc(catalogItems.title))
    .limit(limit + sameProvince.length);
  const result = [...sameProvince];
  for (const c of sameCategory) {
    if (result.length >= limit) break;
    if (!seen.has(c.id)) {
      result.push(c);
      seen.add(c.id);
    }
  }
  return result;
}

export const catalogFacets = cache(async (): Promise<{
  regions: { region: string; count: number }[];
  categories: Record<string, number>;
}> => {
  const [regionRows, categoryRows] = await Promise.all([
    db
      .select({ region: catalogItems.region, count: sql<number>`count(*)::int` })
      .from(catalogItems)
      .where(sql`${catalogItems.region} is not null`)
      .groupBy(catalogItems.region)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({ category: catalogItems.categoryKey, count: sql<number>`count(*)::int` })
      .from(catalogItems)
      .groupBy(catalogItems.categoryKey),
  ]);

  return {
    regions: regionRows
      .filter((r): r is { region: string; count: number } => r.region !== null)
      .map((r) => ({ region: r.region, count: r.count })),
    categories: Object.fromEntries(categoryRows.map((r) => [r.category, r.count])),
  };
});

/**
 * Subcategory facet for one site category (values are canonical — see
 * db/subcategory-map.ts). Only shown on /explore once a category is picked, so it's
 * keyed by category; React.cache dedupes the page + generateMetadata calls.
 */
export const subcategoryFacets = cache(
  async (categoryKey: string): Promise<{ subcategory: string; count: number }[]> => {
    const rows = await db
      .select({ subcategory: catalogItems.subcategory, count: sql<number>`count(*)::int` })
      .from(catalogItems)
      .where(
        and(
          eq(catalogItems.categoryKey, categoryKey),
          sql`${catalogItems.subcategory} is not null`,
        ),
      )
      .groupBy(catalogItems.subcategory)
      .orderBy(desc(sql`count(*)`), asc(catalogItems.subcategory));
    return rows.filter(
      (r): r is { subcategory: string; count: number } => r.subcategory !== null,
    );
  },
);

export type MapPoint = {
  id: string;
  title: string;
  categoryKey: string;
  place: string | null;
  region: string | null;
  lat: number;
  lng: number;
};

/** Every geocoded catalog item, for the /map page. ~879 rows of 7 small columns. */
export async function mapPoints(): Promise<MapPoint[]> {
  const rows = await db
    .select({
      id: catalogItems.id,
      title: catalogItems.title,
      categoryKey: catalogItems.categoryKey,
      place: catalogItems.place,
      region: catalogItems.region,
      lat: catalogItems.lat,
      lng: catalogItems.lng,
    })
    .from(catalogItems)
    .where(sql`${catalogItems.lat} is not null and ${catalogItems.lng} is not null`);
  return rows as MapPoint[];
}

/** URL-safe slug for a region name ("Ilocos Region" -> "ilocos-region"). */
export function slugifyRegion(region: string): string {
  return region
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolve a region slug back to its stored name. Null if no region matches. */
export async function regionBySlug(slug: string): Promise<string | null> {
  // ponytail: 17 distinct regions — scanning the facet list is instant. No slug column needed.
  const { regions } = await catalogFacets();
  return regions.find((r) => slugifyRegion(r.region) === slug)?.region ?? null;
}

export async function listByTag(
  tag: string,
  opts: { page?: number; pageSize?: number } = {},
): Promise<{ items: CatalogItem[]; total: number }> {
  const pageSize = opts.pageSize ?? 24;
  const page = Math.max(1, opts.page ?? 1);
  const offset = (page - 1) * pageSize;
  // @> is the array-contains operator; the GIN default on text[] isn't present, but at 879
  // rows a seq scan is instant. Add `create index ... using gin(tags)` if the catalog grows.
  const where = sql`${catalogItems.tags} @> ARRAY[${tag}]::text[]`;

  const [items, countRows] = await Promise.all([
    db
      .select()
      .from(catalogItems)
      .where(where)
      .orderBy(asc(catalogItems.title))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(catalogItems).where(where),
  ]);
  return { items, total: countRows[0]?.count ?? 0 };
}

export type CatalogSuggestion = { id: string; title: string; region: string | null };

/**
 * Typeahead lookup for the bucket-list builder. Deliberately not `listCatalog`:
 * that sorts alphabetically and runs a COUNT alongside every query, neither of
 * which a per-keystroke endpoint wants. Titles starting with the term rank above
 * mid-string matches so "beach" surfaces "Beach..." before "Hidden beach...".
 */
export async function suggestCatalog(q: string, limit = 8): Promise<CatalogSuggestion[]> {
  const term = `%${q}%`;
  return db
    .select({ id: catalogItems.id, title: catalogItems.title, region: catalogItems.region })
    .from(catalogItems)
    .where(or(ilike(catalogItems.title, term), ilike(catalogItems.place, term)))
    .orderBy(sql`case when ${catalogItems.title} ilike ${q + "%"} then 0 else 1 end`, asc(catalogItems.title))
    .limit(limit);
}

export async function randomItems(n: number): Promise<CatalogItem[]> {
  // ponytail: ORDER BY random() full-scans at 879 rows, which is instant. Swap for
  // TABLESAMPLE or a precomputed random key column if the catalog grows to 100k+.
  return db.select().from(catalogItems).orderBy(sql`random()`).limit(n);
}
