/**
 * Self-check for the destination merge layer. Run it:
 *
 *   npx tsx src/lib/destinations.check.ts
 *
 * ponytail: assertions over a test framework — the project has no runner, and adding one
 * to cover two pure functions would cost more than it protects. If a real suite arrives,
 * these cases port over as-is.
 *
 * What it guards: `destinationFacts` formats money and durations by string-building, so
 * every branch (all-free, single price, free-plus-paid, plural vs singular) is a place a
 * silent copy bug can live — the kind that ships because it still type-checks.
 */
import assert from "node:assert/strict";
import {
  DESTINATIONS,
  destinationAnswer,
  destinationBySlug,
  destinationFacts,
  type Destination,
} from "./destinations";
import { DESTINATIONS_PLAN, type PlannerExperience, type Slot } from "./planner-data";
import { isOptimizableImage } from "./image-hosts";

const base = DESTINATIONS[0];
assert.ok(base, "expected at least one destination");
const sample = base.experiences[0];
assert.ok(sample, "expected the first destination to have experiences");

/** A real experience with the two fields under test overridden — no hand-built fixture to
 *  drift out of sync with the type. */
const exp = (php: number, slot: Slot): PlannerExperience => ({
  ...sample,
  id: `check-${slot}-${php}`,
  php,
  slot,
});

const withExperiences = (experiences: PlannerExperience[]): Destination => ({
  ...base,
  experiences,
});

const costOf = (experiences: PlannerExperience[]) =>
  destinationFacts(withExperiences(experiences)).costRange;
const mixOf = (experiences: PlannerExperience[]) =>
  destinationFacts(withExperiences(experiences)).durationMix;

// --- cost range ------------------------------------------------------------------
assert.equal(costOf([exp(0, "short"), exp(0, "half-day")]), "Free", "all-free reads 'Free'");
assert.equal(costOf([exp(500, "short")]), "₱500", "a single price shows no range");
assert.equal(
  costOf([exp(500, "short"), exp(500, "half-day")]),
  "₱500",
  "identical prices collapse to one figure",
);
assert.equal(
  costOf([exp(300, "short"), exp(4500, "full-day")]),
  "₱300–₱4,500",
  "paid spread uses an en dash and thousands separators",
);
assert.equal(
  costOf([exp(0, "short"), exp(4500, "full-day")]),
  "Free–₱4,500",
  "a free option makes 'Free' the low end",
);
assert.equal(
  costOf([exp(0, "short"), exp(500, "half-day"), exp(500, "full-day")]),
  "Free–₱500",
  "free plus one repeated price still reads as a range",
);

// --- duration mix ----------------------------------------------------------------
assert.equal(mixOf([exp(0, "short")]), "1 quick stop", "singular has no trailing s");
assert.equal(mixOf([exp(0, "short"), exp(0, "short")]), "2 quick stops", "plural adds one");
assert.equal(mixOf([exp(0, "half-day")]), "1 half-day");
assert.equal(mixOf([exp(0, "half-day"), exp(0, "half-day")]), "2 half-days");
assert.equal(mixOf([exp(0, "full-day")]), "1 full day");
assert.equal(mixOf([exp(0, "full-day"), exp(0, "full-day")]), "2 full days");
assert.equal(
  mixOf([exp(0, "short"), exp(0, "full-day"), exp(0, "half-day")]),
  "1 full day · 1 half-day · 1 quick stop",
  "longest slot first, regardless of input order",
);
assert.ok(
  !mixOf([exp(0, "full-day"), exp(0, "short")]).includes("0 "),
  "empty slots are omitted, not printed as zero",
);

// --- merge layer -----------------------------------------------------------------
assert.equal(
  DESTINATIONS.length,
  DESTINATIONS_PLAN.length,
  "every planner destination resolves to a page — adding one is a data edit, not new code",
);

for (const d of DESTINATIONS) {
  assert.ok(d.intro.length > 0, `${d.slug}: falls back to the planner blurb when unwritten`);
  assert.ok(d.tags.length > 0, `${d.slug}: derives tags from experience categories`);
  assert.ok(d.experiences.length > 0, `${d.slug}: a page with nothing to do is not a page`);
  assert.equal(
    destinationFacts(d).experienceCount,
    d.experiences.length,
    `${d.slug}: fact count matches the list rendered beneath it`,
  );
  // Hero photos must stay on an allowlisted host, or `next/image` throws at request time
  // on a page that type-checks fine. Asserted through the same guard the renderer uses.
  if (d.hero) {
    assert.ok(
      isOptimizableImage(d.hero),
      `${d.slug}: hero must be on a host listed in lib/image-hosts.ts`,
    );
  }
}

// --- AEO answer text -------------------------------------------------------------
// Quoted verbatim by answer engines and marked up as FAQPage, so a mangled month range or
// a stray "1 days" is a wrong fact in someone else's answer, not just bad copy here.
const answerFor = (months: number[]) => {
  const d = { ...base, bestMonths: months };
  return destinationAnswer(d, destinationFacts(d));
};

assert.match(
  answerFor([11, 12, 1, 2, 3, 4]),
  /best time to visit is November to April/,
  "a range wrapping the new year reads as one span, not a 6-item list",
);
assert.match(
  answerFor([3, 4, 5]),
  /best time to visit is March to May/,
  "a contiguous run reads as a range",
);
assert.match(answerFor([2]), /best time to visit is February\./, "a single month stands alone");
assert.match(
  answerFor([1, 6]),
  /best time to visit is January and June/,
  "a non-contiguous pair is listed, not spanned",
);
assert.match(
  answerFor(Array.from({ length: 12 }, (_, i) => i + 1)),
  /any time of year/,
  "all twelve months is not a range",
);
assert.match(answerFor([]), /any time of year/, "no data degrades honestly");

const oneDay = { ...base, suggestedDays: 1 };
assert.match(
  destinationAnswer(oneDay, destinationFacts(oneDay)),
  /give it 1 day\./,
  "singular day, not '1 days'",
);

for (const d of DESTINATIONS) {
  const text = destinationAnswer(d, destinationFacts(d));
  assert.ok(!text.includes("undefined"), `${d.slug}: answer leaked an undefined`);
  assert.ok(!text.includes("NaN"), `${d.slug}: answer leaked a NaN`);
  assert.ok(text.length > 80, `${d.slug}: answer too thin to be worth quoting`);
}

// --- image host guard ------------------------------------------------------------
// `CoverImage` routes every URL through this; a wrong answer either crashes the request
// (optimizing an un-allowlisted host) or silently drops optimization on every cover.
assert.equal(isOptimizableImage("https://images.unsplash.com/photo-123?w=100"), true);
assert.equal(isOptimizableImage("https://evil.example.com/x.jpg"), false, "other hosts fall back");
assert.equal(
  isOptimizableImage("https://images.unsplash.com.evil.com/x.jpg"),
  false,
  "suffix look-alikes must not match — this is a hostname check, not a prefix check",
);
assert.equal(isOptimizableImage("/local/cover.jpg"), false, "relative paths aren't optimizable");
assert.equal(isOptimizableImage("not a url"), false, "malformed input returns false, not a throw");
assert.equal(isOptimizableImage(""), false, "empty string returns false, not a throw");

const slugs = new Set(DESTINATIONS.map((d) => d.slug));
assert.equal(slugs.size, DESTINATIONS.length, "slugs are unique — they are the route params");

assert.equal(destinationBySlug("el-nido")?.name, "El Nido");
assert.equal(destinationBySlug("not-a-place"), undefined, "unknown slug is a 404, not a crash");

console.log(`destinations: all checks passed (${DESTINATIONS.length} destinations)`);
