import type { CatalogItem } from "@/db/schema";

/**
 * Quiz types and scoring — the half that runs on both sides of the boundary.
 *
 * Split from `quiz.ts` because that module is `server-only` (it queries Postgres). The quiz
 * UI is a client component and needs the item shape and the archetype logic, so importing it
 * from there would pull a database module into the browser bundle and fail the build.
 */

export type QuizItem = Pick<
  CatalogItem,
  "id" | "title" | "region" | "province" | "place" | "categoryKey"
>;

export type QuizArchetype = {
  key: string;
  label: string;
  blurb: string;
};

/**
 * Traveler archetypes, derived from which categories a reader ticked.
 *
 * Deliberately descriptive, not a ranking: it reads back what someone actually chose rather
 * than scoring them against other people. Percentiles ("top 18%") would need months of real
 * check-off data, and inventing them on a site whose moat is editorial trust is exactly the
 * kind of fiction VIRAL.md rules out.
 */
export const ARCHETYPES: Record<string, QuizArchetype> = {
  travel: {
    key: "travel",
    label: "Island Hopper",
    blurb: "Boats, sandbars, and the next cove over. You measure a trip in coastlines.",
  },
  food: {
    key: "food",
    label: "Food Pilgrim",
    blurb: "You travel stomach-first. The itinerary is a list of meals with places attached.",
  },
  nature: {
    key: "nature",
    label: "Mountain Chaser",
    blurb: "Early starts, hard walks, big views. The reward is always at the top of something.",
  },
  culture: {
    key: "culture",
    label: "Heritage Seeker",
    blurb: "Old streets, old houses, and the stories behind them. You read the plaques.",
  },
  festivals: {
    key: "festivals",
    label: "Fiesta Chaser",
    blurb: "You plan the year around other people's town fiestas. Confetti is a food group.",
  },
  adventure: {
    key: "adventure",
    label: "Adrenaline Local",
    blurb: "If it involves a harness, a board, or a cliff, you have already said tara.",
  },
  default: {
    key: "default",
    label: "The Generalist",
    blurb: "A bit of everything — the sign of someone who says yes first and plans later.",
  },
};

export function archetypeFor(categoryKeys: string[]): QuizArchetype {
  if (categoryKeys.length === 0) return ARCHETYPES.default!;

  const counts = new Map<string, number>();
  for (const key of categoryKeys) counts.set(key, (counts.get(key) ?? 0) + 1);

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const [topKey, topCount] = ranked[0]!;
  const runnerUp = ranked[1]?.[1] ?? 0;

  // A near-tie isn't a specialism — say so rather than forcing a label onto someone.
  if (topCount - runnerUp < 2) return ARCHETYPES.default!;
  return ARCHETYPES[topKey] ?? ARCHETYPES.default!;
}

/** Icons shown per run. Past ~60 the completion rate falls off a cliff — two minutes is the
 *  budget, and a swipe is about two seconds. */
export const QUIZ_SIZE = 60;
