/**
 * Destinations, merged from one source of truth.
 *
 * The facts (name, region, island group, coordinates, gateway, best months, experiences)
 * come from the planner corpus in `planner-data.ts` — the same 17 destinations the trip
 * planner and map already run on. This module layers *editorial* content on top: real
 * hero photos and hand-written intros for the destinations that have them, plus curated
 * tags for cross-linking to the journal.
 *
 * A destination without an editorial entry still gets a full page — it falls back to a
 * tinted cover and its one-line planner blurb, with tags derived from its experiences.
 * That's DESTINATIONS.md's Tier-2 (auto-generated) behaviour, and it's why adding a
 * destination is a data edit in `planner-data.ts`, not new code here.
 *
 * The catalog-driven, all-of-the-Philippines version in DESTINATIONS.md needs the Neon
 * catalog; this is the backend-free slice that ships the page template today.
 */
import {
  DESTINATIONS_PLAN,
  MONTHS,
  plannerDestinationBySlug,
  type PlannerDestination,
} from "@/lib/planner-data";

/**
 * Hero photo source. Always `images.unsplash.com`, which is the host allowlisted in
 * `next.config.ts` — that's what lets these render through `next/image` (AVIF/WebP,
 * responsive `srcset`, no layout shift). AUDIT.md's M6 deferral is about *editor-supplied*
 * post covers, which can be any host; these are ours, so the deferral doesn't apply.
 * Request one wide source and let the optimizer derive the rest.
 */
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=2000&q=80`;

type Content = {
  /** Real hero photo. Omit for a tinted editorial cover. */
  hero?: string;
  /** Hand-written intro paragraphs. Omit to fall back to the planner blurb. */
  intro?: string[];
  /** Tags for journal cross-linking. Omit to derive from experience categories. */
  tags?: string[];
};

// The six destinations that had hand-written guides before the merge. Their prose and
// photos are preserved here as overrides; everything else about them now comes from the
// planner corpus, so there's a single place to edit facts.
const CONTENT: Record<string, Content> = {
  "el-nido": {
    hero: U("1519046904884-53103b34b206"),
    intro: [
      "El Nido is the poster child of Philippine island-hopping, and it earns it. Karst cliffs rise straight out of turquoise water, and the lagoons hidden between them feel like secrets you paddled into.",
      "Base yourself in town or on a quieter beach, then pick a tour (A to D) or charter a private bangka to skip the crowds.",
    ],
    tags: ["islands", "beaches", "kayaking"],
  },
  siargao: {
    hero: U("1502680390469-be75c86b636f"),
    intro: [
      "Cloud 9 put Siargao on the map, but the island keeps people for the rock pools, palm-lined roads, and the easiest pace in the country.",
      "Learn to surf on the beach breaks, motorbike to Sugba Lagoon, and end every day with a sunset at Maasin River.",
    ],
    tags: ["surf", "islands", "lagoon"],
  },
  vigan: {
    hero: U("1591017403286-fd8493524e1e"),
    intro: [
      "Vigan is one of the best-preserved colonial towns in Asia. Walk Calle Crisologo at 6am, when the cobblestones are quiet and the light is gold.",
      "Ride a kalesa, watch pots thrown at a burnay pottery, and eat your weight in Vigan longganisa and empanada.",
    ],
    tags: ["heritage", "food", "history"],
  },
  banaue: {
    hero: U("1552465011-b4e21bf6e79a"),
    intro: [
      "The Banaue and Batad terraces are hand-carved amphitheatres of rice, still farmed today. Batad's stone-walled bowl is the postcard, reached by a short but steep trek.",
      "Hire a local guide, stay in a simple homestay, and wake early for the terraces in morning mist.",
    ],
    tags: ["nature", "hiking", "heritage"],
  },
  cebu: {
    hero: U("1520942702018-0862200e6873"),
    intro: [
      "Cebu packs a lot in: jump and swim through Kawasan's turquoise canyons in the south, snorkel with sardines in Moalboal, then eat the best lechon of your life.",
      "The city is a real hub, so it is easy to combine with Bohol or Siquijor.",
    ],
    tags: ["adventure", "food", "diving"],
  },
  bohol: {
    hero: U("1519046904884-53103b34b206"),
    intro: [
      "Bohol is the easy-going all-rounder: the surreal Chocolate Hills inland, tiny tarsiers in the forest, and Panglao's beaches and dive sites just across a bridge.",
      "Cruise the Loboc River, then base on Panglao for Balicasag's reefs.",
    ],
    tags: ["nature", "beaches", "diving"],
  },
};

export type Destination = PlannerDestination & {
  hero?: string;
  intro: string[];
  tags: string[];
};

/** Unique experience categories in editorial order — the honest tag set for a destination
 *  with no hand-picked one. */
function deriveTags(d: PlannerDestination): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of d.experiences) {
    if (!seen.has(e.categoryKey)) {
      seen.add(e.categoryKey);
      out.push(e.categoryKey);
    }
  }
  return out;
}

function resolve(d: PlannerDestination): Destination {
  const c = CONTENT[d.slug] ?? {};
  return {
    ...d,
    hero: c.hero,
    intro: c.intro ?? [d.blurb],
    tags: c.tags ?? deriveTags(d),
  };
}

export const DESTINATIONS: Destination[] = DESTINATIONS_PLAN.map(resolve);

export function destinationBySlug(slug: string): Destination | undefined {
  const d = plannerDestinationBySlug(slug);
  return d ? resolve(d) : undefined;
}

/**
 * The hero photo cropped to the exact 1200×630 every social platform wants.
 *
 * Unsplash crops server-side, so we get the real photograph at the right aspect ratio
 * without fetching and compositing it ourselves at build time — no extra network dependency
 * in the build, and no letterboxing in the preview. Destinations without a hero return
 * undefined and fall through to the generated card in `opengraph-image.tsx`.
 */
export function destinationOgImage(d: Destination): string | undefined {
  return d.hero?.replace(/\?.*$/, "?w=1200&h=630&fit=crop&crop=entropy&q=80");
}

const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

/** Month ranges read as "November to April", not "Nov, Dec, Jan, Feb, Mar, Apr". */
function monthPhrase(months: number[], names: readonly string[]): string {
  if (months.length === 0) return "any time of year";
  if (months.length >= 12) return "any time of year";

  const sorted = [...months].sort((a, b) => a - b);
  // Best months usually wrap the new year (Nov–Apr). Rotate so a wrapping set is one run.
  const wraps = sorted.includes(1) && sorted.includes(12);
  const ordered = wraps
    ? [...sorted.filter((m) => m >= 7), ...sorted.filter((m) => m < 7)]
    : sorted;

  // Contiguous (allowing the wrap) → a range; otherwise list them.
  const contiguous = ordered.every((m, i) => {
    if (i === 0) return true;
    const prev = ordered[i - 1]!;
    return m === prev + 1 || (prev === 12 && m === 1);
  });

  const name = (m: number) => names[m - 1] ?? String(m);
  if (contiguous && ordered.length > 2) {
    return `${name(ordered[0]!)} to ${name(ordered[ordered.length - 1]!)}`;
  }
  if (ordered.length === 1) return name(ordered[0]!);
  return `${ordered.slice(0, -1).map(name).join(", ")} and ${name(ordered[ordered.length - 1]!)}`;
}

/**
 * One self-contained paragraph answering "should I go, when, and what will it cost".
 *
 * Answer engines quote a passage, not a page — and they quote passages that stand alone
 * without the surrounding layout. Everything here is derived from the same data the page
 * renders, so it can't contradict the page, and there is nothing to keep in sync by hand.
 */
export function destinationAnswer(d: Destination, facts: DestinationFacts): string {
  const when = monthPhrase(d.bestMonths, MONTHS);
  const cost =
    facts.costRange === "Free"
      ? "and the listed activities are free"
      : `with activities from ${facts.costRange.toLowerCase().startsWith("free") ? "free" : facts.costRange.split("–")[0]} to ${facts.costRange.split("–").pop()}`;

  return `${d.name} is in ${d.region}, ${d.islandGroup}. Most travellers give it ${d.suggestedDays} ${
    d.suggestedDays === 1 ? "day" : "days"
  }. The best time to visit is ${when}. We list ${facts.experienceCount} things to do there ${cost} per person. Getting there: ${d.gateway}`;
}

export type DestinationFacts = {
  experienceCount: number;
  freeCount: number;
  /** "Free" when everything is free, else "Free–₱4,500" / "₱300–₱4,500". */
  costRange: string;
  /** Human duration mix, e.g. "3 full days · 2 half-days · 1 short". */
  durationMix: string;
};

// Pluralised by appending "s", so each label has to read correctly both ways:
// "1 quick stop" / "2 quick stops". ("short" would have pluralised to "2 shorts".)
const SLOT_LABEL = {
  short: "quick stop",
  "half-day": "half-day",
  "full-day": "full day",
} as const;

export function destinationFacts(d: Destination): DestinationFacts {
  const prices = d.experiences.map((e) => e.php);
  const free = prices.filter((p) => p === 0).length;
  const paid = prices.filter((p) => p > 0);
  const min = paid.length ? Math.min(...paid) : 0;
  const max = paid.length ? Math.max(...paid) : 0;

  let costRange: string;
  if (paid.length === 0) costRange = "Free";
  else {
    const low = free > 0 ? "Free" : peso(min);
    costRange = min === max && free === 0 ? peso(min) : `${low}–${peso(max)}`;
  }

  const slots = { short: 0, "half-day": 0, "full-day": 0 };
  for (const e of d.experiences) slots[e.slot]++;
  const durationMix = (["full-day", "half-day", "short"] as const)
    .filter((s) => slots[s] > 0)
    .map((s) => `${slots[s]} ${SLOT_LABEL[s]}${slots[s] === 1 ? "" : "s"}`)
    .join(" · ");

  return {
    experienceCount: d.experiences.length,
    freeCount: free,
    costRange,
    durationMix,
  };
}
