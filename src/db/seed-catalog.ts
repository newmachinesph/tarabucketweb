// Seeds catalog_items from the all-bucket-list dataset (879 Philippine experiences).
//
// Run: npm run db:seed:catalog
// Idempotent — upserts by id, so re-running refreshes rather than duplicates.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { catalogItems, type NewCatalogItem } from "./schema";
import { canonicalSubcategory } from "./subcategory-map";

// Same source the mobile catalog used. Kept as a sibling-repo path rather than copied in,
// so there is one source of truth for the 879 items.
const SRC = resolve(
  process.cwd(),
  "../all-bucket-list/data/bucket-list.json",
);

// The catalog ships 14 categories; the site's taxonomy (lib/categories.ts) has 6. This
// collapses them. Lossy on purpose — source_category preserves the original, so a finer
// filter can always re-derive it. Anything unmapped throws rather than silently defaulting.
const CATEGORY_MAP: Record<string, string> = {
  Travel: "travel",
  "Food & Drink": "food",
  "Festivals & Events": "festivals",
  "Adventure & Sports": "adventure",
  "Sports & Fitness": "adventure",
  "Challenges & Collections": "adventure",
  "Nature & Wildlife": "nature",
  "Culture & Heritage": "culture",
  "Life & Local Experiences": "culture",
  "Wellness & Spirituality": "culture",
  "Skills & Learning": "culture",
  "Entertainment & Pop Culture": "culture",
  "Volunteering & Community": "culture",
  "Family & Relationships": "culture",
};

type SourceItem = {
  id: string;
  title: string;
  verb?: string;
  subject?: string;
  category: string;
  subcategory?: string;
  tertiary?: string;
  location?: { region?: string; province?: string; place?: string };
  tags?: string[];
  description?: string;
  cost_band?: string;
  duration?: string;
  difficulty?: string;
};

async function main() {
  const items = JSON.parse(readFileSync(SRC, "utf8")) as SourceItem[];
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No items found in ${SRC}`);
  }

  const unmapped = new Set<string>();
  const rows: NewCatalogItem[] = items.map((it) => {
    const categoryKey = CATEGORY_MAP[it.category];
    if (!categoryKey) unmapped.add(it.category);
    const loc = it.location ?? {};
    return {
      id: it.id,
      title: it.title,
      verb: it.verb ?? null,
      subject: it.subject ?? null,
      categoryKey: categoryKey ?? "travel",
      sourceCategory: it.category,
      // Canonicalized so the facet UI never sees "Cultural Festival" vs "Cultural Festivals".
      subcategory: canonicalSubcategory(categoryKey ?? "travel", it.subcategory),
      tertiary: it.tertiary ?? null,
      region: loc.region ?? null,
      province: loc.province ?? null,
      place: loc.place ?? null,
      tags: it.tags ?? [],
      description: it.description ?? null,
      costBand: it.cost_band ?? null,
      duration: it.duration ?? null,
      difficulty: it.difficulty ?? null,
    };
  });

  // Fail loudly: an unmapped category means the source grew one and CATEGORY_MAP needs a
  // line — better to stop than seed 100 items into the wrong bucket.
  if (unmapped.size > 0) {
    throw new Error(`Unmapped categories: ${[...unmapped].join(", ")}`);
  }

  console.log(`Seeding ${rows.length} catalog items...`);
  // Chunked upsert — a single insert of 879 rows with ~14 columns each is well within
  // Postgres parameter limits, but chunking keeps it safe if the dataset grows.
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK);
    await db
      .insert(catalogItems)
      .values(batch)
      .onConflictDoUpdate({
        target: catalogItems.id,
        // excluded.* is the row Postgres tried to insert — this refreshes every column to
        // the new value on re-seed. Setting to catalogItems.* would set each column to
        // itself (a no-op), so changed source data would never propagate.
        set: {
          title: sql`excluded.title`,
          verb: sql`excluded.verb`,
          subject: sql`excluded.subject`,
          categoryKey: sql`excluded.category_key`,
          sourceCategory: sql`excluded.source_category`,
          subcategory: sql`excluded.subcategory`,
          tertiary: sql`excluded.tertiary`,
          region: sql`excluded.region`,
          province: sql`excluded.province`,
          place: sql`excluded.place`,
          tags: sql`excluded.tags`,
          description: sql`excluded.description`,
          costBand: sql`excluded.cost_band`,
          duration: sql`excluded.duration`,
          difficulty: sql`excluded.difficulty`,
        },
      });
  }

  const cats = new Set(rows.map((r) => r.categoryKey));
  const regions = new Set(rows.map((r) => r.region).filter(Boolean));
  console.log(
    `Seed complete. ${rows.length} items across ${cats.size} categories, ${regions.size} regions.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Catalog seed failed:", err);
  process.exit(1);
});
