import "server-only";
import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { catalogItems, type CatalogItem } from "@/db/schema";

export const COST_BANDS = ["free", "budget", "mid", "splurge", "luxury"] as const;
export const DURATIONS = ["hours", "half-day", "day", "weekend", "multi-day"] as const;
export const DIFFICULTIES = ["easy", "moderate", "hard"] as const;

export type CatalogFilters = {
  category?: string;
  region?: string;
  province?: string;
  cost?: string;
  duration?: string;
  difficulty?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

function buildWhere(filters: CatalogFilters) {
  const conditions = [];
  if (filters.category) conditions.push(eq(catalogItems.categoryKey, filters.category));
  if (filters.region) conditions.push(eq(catalogItems.region, filters.region));
  if (filters.province) conditions.push(eq(catalogItems.province, filters.province));
  if (filters.cost) conditions.push(eq(catalogItems.costBand, filters.cost));
  if (filters.duration) conditions.push(eq(catalogItems.duration, filters.duration));
  if (filters.difficulty) conditions.push(eq(catalogItems.difficulty, filters.difficulty));
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

export async function getCatalogItem(id: string): Promise<CatalogItem | null> {
  const [row] = await db.select().from(catalogItems).where(eq(catalogItems.id, id)).limit(1);
  return row ?? null;
}

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

export async function catalogFacets(): Promise<{
  regions: { region: string; count: number }[];
  categories: Record<string, number>;
}> {
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

export async function randomItems(n: number): Promise<CatalogItem[]> {
  // ponytail: ORDER BY random() full-scans at 879 rows, which is instant. Swap for
  // TABLESAMPLE or a precomputed random key column if the catalog grows to 100k+.
  return db.select().from(catalogItems).orderBy(sql`random()`).limit(n);
}
