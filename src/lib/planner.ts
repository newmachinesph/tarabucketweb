import type { CategoryKey } from "@/lib/categories";
import {
  DESTINATIONS_PLAN,
  MONTHS,
  SLOT_COST,
  plannerDestinationBySlug,
  type PlannerDestination,
  type PlannerExperience,
} from "@/lib/planner-data";

/**
 * Deterministic itinerary engine.
 *
 * This is the *stand-in* for Phase 1's LLM + RAG planner described in PLAN.md, and it is
 * deliberately rules-based: given the same inputs it always returns the same plan, it
 * needs no API key, and it cannot hallucinate a place that doesn't exist. The output
 * shape (`Plan`) is the contract the real planner will have to satisfy, so swapping the
 * engine underneath shouldn't touch the UI.
 *
 * Determinism also matters mechanically: the planner runs in a client component, and a
 * generator that used `Math.random()` or the current time would produce different output
 * on every render.
 */

export type Pace = "relaxed" | "balanced" | "packed";
export type Budget = "budget" | "mid" | "splurge";

export type PlanInput = {
  /** Destination slugs, in visiting order. */
  destinations: string[];
  days: number;
  pace: Pace;
  budget: Budget;
  /** Empty means "no preference" — everything scores equally. */
  interests: CategoryKey[];
  /** 1-12. Drives the seasonality warnings. */
  month?: number;
};

export type PlanDay = {
  day: number;
  destination: PlannerDestination;
  experiences: PlannerExperience[];
  php: number;
  /** Arrival days lose most of their capacity to getting there. */
  isTravelDay: boolean;
};

export type PlanNote = {
  kind: "season" | "logistics" | "budget" | "pace";
  text: string;
};

export type Plan = {
  days: PlanDay[];
  destinations: PlannerDestination[];
  totalPhp: number;
  notes: PlanNote[];
};

/** Time budget per day, by pace. Compare against SLOT_COST. */
const DAY_CAPACITY: Record<Pace, number> = {
  relaxed: 3,
  balanced: 4,
  packed: 6,
};

const COST_RANK = { free: 0, budget: 1, mid: 2, splurge: 3 } as const;
const BUDGET_TARGET: Record<Budget, number> = { budget: 1, mid: 2, splurge: 3 };

/** More than this and a trip becomes a transit schedule with sightseeing attached. */
export const MAX_DESTINATIONS = 4;

/**
 * Anything this far above the stated budget is dropped outright rather than merely
 * ranked down. Someone who said "budget" shouldn't be handed a ₱4,500 wreck dive just
 * because their trip is long enough to have room for it — one band over is a stretch,
 * two is the wrong trip.
 */
function withinBudget(exp: PlannerExperience, budget: Budget): boolean {
  return COST_RANK[exp.costBand] - BUDGET_TARGET[budget] < 2;
}

function score(
  exp: PlannerExperience,
  index: number,
  total: number,
  input: PlanInput,
): number {
  let s = 0;

  if (input.interests.length > 0 && input.interests.includes(exp.categoryKey)) s += 4;

  // One band over budget is allowed but penalised; under budget gets a nudge, because a
  // cheaper option that still fits the interests is usually the better recommendation.
  const over = COST_RANK[exp.costBand] - BUDGET_TARGET[input.budget];
  if (over > 0) s -= over * 3;
  else if (over < 0) s += 0.5;

  // Editorial order within a destination is the tiebreak: the list is curated
  // signature-first, and that ordering shouldn't be thrown away by equal scores.
  s += ((total - index) / total) * 0.5;

  return s;
}

/**
 * Split `days` across destinations, weighted by how long each is actually worth. Every
 * destination keeps at least one day — the caller trims the list before this runs.
 */
function allocateDays(destinations: PlannerDestination[], days: number): number[] {
  const weights = destinations.map((d) => d.suggestedDays);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const alloc = weights.map((w) => Math.max(1, Math.floor((w / totalWeight) * days)));
  let remaining = days - alloc.reduce((a, b) => a + b, 0);

  // Hand out (or claw back) the rounding remainder to whichever destination is currently
  // furthest from its ideal length.
  while (remaining > 0) {
    let best = 0;
    for (let i = 1; i < alloc.length; i++) {
      if (weights[i]! / alloc[i]! > weights[best]! / alloc[best]!) best = i;
    }
    alloc[best]!++;
    remaining--;
  }
  while (remaining < 0) {
    let best = -1;
    for (let i = 0; i < alloc.length; i++) {
      if (alloc[i]! <= 1) continue;
      if (best === -1 || weights[i]! / alloc[i]! < weights[best]! / alloc[best]!) best = i;
    }
    if (best === -1) break; // everything is already down to a single day
    alloc[best]!--;
    remaining++;
  }

  return alloc;
}

function seasonNotes(destinations: PlannerDestination[], month?: number): PlanNote[] {
  if (!month) return [];
  const monthName = MONTHS[month - 1];
  const offSeason = destinations.filter((d) => !d.bestMonths.includes(month));
  if (offSeason.length === 0) {
    return [
      {
        kind: "season",
        text: `${monthName} is a good month for everywhere on this trip.`,
      },
    ];
  }
  return offSeason.map((d) => ({
    kind: "season" as const,
    text: `${monthName} is outside ${d.name}'s best window (${d.bestMonths
      .map((m) => MONTHS[m - 1]!.slice(0, 3))
      .join(", ")}). Expect rain, rougher crossings, or cancelled boats.`,
  }));
}

function logisticsNotes(destinations: PlannerDestination[], days: number): PlanNote[] {
  const notes: PlanNote[] = [];

  const groups = new Set(destinations.map((d) => d.islandGroup));
  if (groups.size > 1) {
    notes.push({
      kind: "logistics",
      text: `This crosses ${[...groups].join(" and ")}, so budget for a domestic flight between them — there's rarely a sensible land route.`,
    });
  }

  if (destinations.length > 1 && days / destinations.length < 2.5) {
    notes.push({
      kind: "logistics",
      text: `${destinations.length} destinations in ${days} days averages under two and a half days each. Dropping one buys you a real day everywhere else.`,
    });
  }

  for (const d of destinations) {
    notes.push({ kind: "logistics", text: `${d.name}: ${d.gateway}.` });
  }

  return notes;
}

export function buildPlan(input: PlanInput): Plan {
  const days = Math.max(1, Math.min(21, Math.floor(input.days)));

  // Resolve, dedupe, and keep the caller's order.
  const seen = new Set<string>();
  let destinations = input.destinations
    .map((slug) => plannerDestinationBySlug(slug))
    .filter((d): d is PlannerDestination => {
      if (!d || seen.has(d.slug)) return false;
      seen.add(d.slug);
      return true;
    })
    .slice(0, MAX_DESTINATIONS);

  if (destinations.length === 0) destinations = [DESTINATIONS_PLAN[0]!];
  // A destination can't get less than a day, so a short trip means fewer stops.
  const trimmed = destinations.length > days;
  if (trimmed) destinations = destinations.slice(0, days);

  const allocation = allocateDays(destinations, days);
  const capacity = DAY_CAPACITY[input.pace];

  const planDays: PlanDay[] = [];
  let dayNumber = 1;

  destinations.forEach((destination, di) => {
    const ranked = destination.experiences
      .filter((exp) => withinBudget(exp, input.budget))
      .map((exp, i) => ({ exp, i, s: score(exp, i, destination.experiences.length, input) }))
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .map((r) => r.exp);

    const dayCount = allocation[di]!;
    const buckets: PlannerExperience[][] = Array.from({ length: dayCount }, () => []);
    const used = new Array<number>(dayCount).fill(0);

    // Arriving somewhere eats most of a day. The very first day of the trip is exempt —
    // that arrival happened before the itinerary starts.
    const arrivalIndex = di === 0 ? -1 : 0;
    if (arrivalIndex >= 0) used[arrivalIndex] = Math.max(0, capacity - 1);

    for (const exp of ranked) {
      const cost = SLOT_COST[exp.slot];
      const target = used.findIndex((u) => u + cost <= capacity);
      if (target === -1) break; // every day is full — the rest doesn't fit this trip
      buckets[target]!.push(exp);
      used[target]! += cost;
    }

    buckets.forEach((experiences, bi) => {
      planDays.push({
        day: dayNumber++,
        destination,
        experiences,
        php: experiences.reduce((sum, e) => sum + e.php, 0),
        isTravelDay: bi === arrivalIndex,
      });
    });
  });

  const notes: PlanNote[] = [
    ...seasonNotes(destinations, input.month),
    ...logisticsNotes(destinations, days),
  ];

  if (trimmed) {
    notes.unshift({
      kind: "logistics",
      text: `Only the first ${destinations.length} destination${destinations.length === 1 ? "" : "s"} fit in ${days} day${days === 1 ? "" : "s"} — the rest were dropped rather than given half a day each.`,
    });
  }

  const totalPhp = planDays.reduce((sum, d) => sum + d.php, 0);
  notes.push({
    kind: "budget",
    text: `Roughly ₱${totalPhp.toLocaleString("en-PH")} per person for the activities listed. Flights, rooms, food, and getting around are on top.`,
  });

  return { days: planDays, destinations, totalPhp, notes };
}

/** Flattens a plan into bucket-list lines, for saving it as a board. */
export function planToBucketItems(plan: Plan): string[] {
  return plan.days.flatMap((d) =>
    d.experiences.map((e) => `${e.title} (${d.destination.name})`),
  );
}
