import "server-only";
import { cache } from "react";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { catalogItems } from "@/db/schema";
import { CATEGORIES } from "@/lib/categories";
import { QUIZ_SIZE, type QuizItem } from "@/lib/quiz-shared";

// Re-exported so pages can pull everything quiz-related from one place.
export { QUIZ_SIZE, ARCHETYPES, archetypeFor } from "@/lib/quiz-shared";
export type { QuizItem, QuizArchetype } from "@/lib/quiz-shared";

/**
 * Item selection for the 879 Quiz — the activation surface from VIRAL.md.
 *
 * The whole point of the quiz is that a stranger who saw a friend's score card can get
 * their own comparable number in under two minutes. Two constraints follow from that, and
 * both are why this isn't just `ORDER BY random()`:
 *
 *  1. **Regional balance.** The named risk is an icon set skewed to Manila and Palawan —
 *     a Bisaya or Mindanaoan reader who sees nothing from home bounces, and bounces are
 *     the one thing an activation surface cannot afford. So the set is filled round-robin
 *     across regions, then across categories within each region.
 *
 *  2. **Stability.** The score has to mean the same thing for everyone who compares it in
 *     a group chat this week, and the page has to be cacheable. So the shuffle is seeded
 *     and rotates on a slow clock (see `quizEdition`) rather than per request.
 */

/**
 * The edition key: which slice of the catalog this week's quiz draws from.
 *
 * Rotating means a returning reader gets fresh icons instead of the same 60 forever, but
 * rotating *fast* would make two friends' scores incomparable. Weekly is the compromise —
 * a score stays meaningful for as long as anyone is likely to be comparing it.
 */
export function quizEdition(now: Date = new Date()): number {
  const epoch = Date.UTC(2026, 0, 5); // a Monday, so editions turn over on Mondays
  return Math.max(0, Math.floor((now.getTime() - epoch) / (7 * 24 * 60 * 60 * 1000)));
}

/** Deterministic 32-bit hash — a stable stand-in for Math.random() that we can seed. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable ordering keyed by `seed` — same seed, same order, on every server and render. */
function seededSort<T>(items: T[], seed: string, key: (t: T) => string): T[] {
  return [...items].sort((a, b) => hash(seed + key(a)) - hash(seed + key(b)));
}

/**
 * Pull the pool the quiz draws from.
 *
 * "Iconic" is approximated by what the catalog already knows rather than by a new column:
 * an item with a real description and a place is one an editor actually wrote up, which is
 * a better proxy for recognisable than anything we could invent. 879 rows is small enough
 * to sort in Node — no index needed.
 */
const quizPool = cache(async (): Promise<QuizItem[]> => {
  return db
    .select({
      id: catalogItems.id,
      title: catalogItems.title,
      region: catalogItems.region,
      province: catalogItems.province,
      place: catalogItems.place,
      categoryKey: catalogItems.categoryKey,
    })
    .from(catalogItems)
    .where(
      sql`${catalogItems.region} is not null
          and ${catalogItems.region} <> ''
          and ${catalogItems.description} is not null
          and length(${catalogItems.description}) > 40`,
    );
});

/**
 * `QUIZ_SIZE` items, spread as evenly across regions as the catalog allows.
 *
 * Round-robin over regions rather than a proportional sample: proportional would hand most
 * of the 60 slots to whichever regions the catalog covers best, which is exactly the
 * Manila/Palawan skew we're avoiding. Every region gets a turn before any region gets a
 * second one.
 */
export const quizItems = cache(async (): Promise<QuizItem[]> => {
  const pool = await quizPool();
  if (pool.length === 0) return [];

  const seed = `quiz-${quizEdition()}`;
  // `categoryKey` is a plain text column, so widen the key type — a row carrying a category
  // outside the taxonomy sorts last rather than failing the build.
  const categoryOrder = new Map<string, number>(CATEGORIES.map((c, i) => [c.key, i]));

  // Group by region, and within a region interleave categories so one region's slots
  // aren't all beaches.
  const byRegion = new Map<string, QuizItem[]>();
  for (const item of pool) {
    const region = item.region ?? "";
    const list = byRegion.get(region);
    if (list) list.push(item);
    else byRegion.set(region, [item]);
  }

  const queues = seededSort([...byRegion.entries()], seed, ([region]) => region).map(
    ([, items]) =>
      seededSort(items, seed, (i) => i.id).sort(
        (a, b) =>
          (categoryOrder.get(a.categoryKey) ?? 99) - (categoryOrder.get(b.categoryKey) ?? 99),
      ),
  );

  const picked: QuizItem[] = [];
  for (let round = 0; picked.length < QUIZ_SIZE; round++) {
    let tookAny = false;
    for (const queue of queues) {
      if (picked.length >= QUIZ_SIZE) break;
      const next = queue[round];
      if (!next) continue;
      picked.push(next);
      tookAny = true;
    }
    // Every queue is exhausted — the catalog is smaller than QUIZ_SIZE. Ship what we have.
    if (!tookAny) break;
  }

  // Round-robin leaves the deck sorted by region; shuffle so consecutive cards feel varied.
  return seededSort(picked, `${seed}-deal`, (i) => i.id);
});
