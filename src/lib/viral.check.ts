/**
 * Self-check for the VIRAL.md mechanics. Run it:
 *
 *   npx tsx src/lib/viral.check.ts
 *
 * Covers the three things here that are logic rather than layout, and where being wrong is
 * expensive rather than ugly:
 *
 *  - **Holiday/bridge math** tells someone which day to file leave for. Off by one and they
 *    burn a leave day on a working Tuesday.
 *  - **List transfer** is the backup path. A round-trip that silently drops entries loses
 *    exactly the data it exists to protect.
 *  - **The archetype** is quoted back at people about themselves, so a tie must not be
 *    reported as a specialism.
 */
import assert from "node:assert/strict";
import {
  HOLIDAYS_2027,
  addDays,
  findBridges,
  isWeekend,
  parseDate,
  weekdayOf,
} from "./holidays";
import { decodeList, encodeList, mergeEntries } from "./list-transfer";
// `quiz-shared`, not `quiz`: the latter opens a database connection at import.
import { archetypeFor } from "./quiz-shared";
import type { ProgressEntry } from "./progress";

// --- calendar primitives ----------------------------------------------------------
// Verified against the real 2027 calendar; these anchor everything else.
assert.equal(weekdayOf("2027-01-01"), 5, "1 Jan 2027 is a Friday");
assert.equal(weekdayOf("2027-03-28"), 0, "Easter Sunday 2027 is 28 March");
assert.equal(weekdayOf("2027-08-30"), 1, "National Heroes Day 2027 is Monday 30 August");
assert.equal(isWeekend("2027-05-01"), true, "Labor Day 2027 falls on a Saturday");
assert.equal(isWeekend("2027-03-25"), false, "Maundy Thursday is a weekday");

assert.equal(addDays("2027-02-28", 1), "2027-03-01", "2027 is not a leap year");
assert.equal(addDays("2027-12-31", 1), "2028-01-01", "rolls over the year");
assert.equal(addDays("2027-01-01", -1), "2026-12-31", "goes backwards");
assert.equal(
  parseDate("2027-06-12").getUTCDate(),
  12,
  "dates are parsed as UTC, so the calendar day never shifts with the server timezone",
);

// --- holiday data integrity -------------------------------------------------------
{
  const seen = new Set<string>();
  for (const h of HOLIDAYS_2027) {
    assert.match(h.date, /^2027-\d{2}-\d{2}$/, `${h.name}: date must be an ISO day in 2027`);
    assert.ok(!seen.has(h.date), `${h.date}: two holidays on one date would double-count`);
    seen.add(h.date);
    assert.ok(h.name.length > 0, "every holiday needs a name");
  }
  // The whole trust proposition of the tool is this distinction existing at all.
  assert.ok(
    HOLIDAYS_2027.some((h) => h.status === "law"),
    "some holidays must be marked fixed by law",
  );
  assert.ok(
    HOLIDAYS_2027.some((h) => h.status !== "law"),
    "some must be marked provisional, or the tool is overclaiming",
  );
}

// --- bridge finding ---------------------------------------------------------------
{
  const zero = findBridges(HOLIDAYS_2027, 0, 2027);
  const two = findBridges(HOLIDAYS_2027, 2, 2027);
  const five = findBridges(HOLIDAYS_2027, 5, 2027);

  assert.ok(zero.length > 0, "2027 has long weekends even with no leave filed");
  assert.ok(
    zero.every((b) => b.leaveDays.length === 0),
    "with maxLeave=0 no bridge may ask for a leave day",
  );
  assert.ok(
    two.every((b) => b.leaveDays.length <= 2),
    "no bridge may exceed the leave budget it was asked for",
  );

  for (const b of [...zero, ...two, ...five]) {
    assert.ok(b.length >= 3, "a 'long weekend' shorter than 3 days is not one");
    assert.ok(b.start <= b.end, `${b.start}: start must not follow end`);
    // The span must actually be the number of days claimed.
    let span = 1;
    for (let d = b.start; d !== b.end; d = addDays(d, 1)) span++;
    assert.equal(span, b.length, `${b.start}: length must match the date span`);

    // Leave days must be working days inside the window — filing for a Sunday is nonsense.
    for (const day of b.leaveDays) {
      assert.ok(day >= b.start && day <= b.end, `${b.start}: leave day outside the window`);
      assert.ok(!isWeekend(day), `${day}: never tell anyone to file leave for a weekend`);
      assert.ok(
        !HOLIDAYS_2027.some((h) => h.date === day),
        `${day}: never tell anyone to file leave for a holiday`,
      );
    }

    // Provisional must be true iff a contributing holiday isn't fixed in law.
    assert.equal(
      b.provisional,
      b.holidays.some((h) => h.status !== "law"),
      `${b.start}: the provisional flag must match the holidays behind it`,
    );
  }

  // More leave can never find fewer days off in total.
  const daysOff = (bs: ReturnType<typeof findBridges>) =>
    bs.reduce((sum, b) => sum + b.length, 0);
  assert.ok(daysOff(five) >= daysOff(two), "more leave must not yield less time off");
  assert.ok(daysOff(two) >= daysOff(zero), "more leave must not yield less time off");

  // Holy Week 2027 is the headline case: Thu 25 + Fri 26 March are holidays, so Thu-Sun is
  // four days with nothing filed.
  const holyWeek = zero.find((b) => b.start <= "2027-03-25" && b.end >= "2027-03-28");
  assert.ok(holyWeek, "Holy Week 2027 must surface with zero leave days");
  assert.ok(holyWeek.length >= 4, "Maundy Thursday through Easter Sunday is at least 4 days");
}

// --- list transfer ----------------------------------------------------------------
{
  const entry = (id: string, at = "2026-01-02T03:04:05.000Z"): ProgressEntry => ({
    id,
    title: `Título ñ ${id} — Bisayâ`, // non-ASCII: btoa alone would throw on this
    region: "Central Visayas",
    categoryKey: "travel",
    at,
  });

  const done = [entry("a"), entry("b")];
  const saved = [entry("c")];
  const round = decodeList(encodeList(done, saved));

  assert.ok(round, "a freshly encoded list must decode");
  assert.equal(round.done.length, 2);
  assert.equal(round.saved.length, 1);
  assert.equal(round.done[0]!.title, done[0]!.title, "non-ASCII titles survive the round trip");

  // A token is pasted through chat apps and address bars — it must not need escaping.
  const token = encodeList(done, saved);
  assert.match(token, /^[A-Za-z0-9_-]+$/, "token must be URL-safe with no padding");
  assert.equal(encodeURIComponent(token), token, "token must survive being put in a query string");

  // Malformed input returns null rather than throwing into a render.
  for (const bad of ["", "!!!!", "e30", "bm90IGpzb24"]) {
    assert.equal(decodeList(bad), null, `"${bad}" must decode to null, not throw`);
  }

  // Merging is a union, never a replacement — restoring must not delete local progress.
  const local = [entry("a", "2025-01-01T00:00:00.000Z"), entry("z")];
  const merged = mergeEntries(local, [entry("a"), entry("b")]);
  assert.equal(merged.length, 3, "union keeps local-only, incoming-only, and shared entries");
  assert.ok(merged.some((e) => e.id === "z"), "a local entry absent from the link is kept");
  assert.equal(
    merged.find((e) => e.id === "a")!.at,
    "2025-01-01T00:00:00.000Z",
    "on conflict the earlier date wins — the first time you did it is the true date",
  );

  const empty = decodeList(encodeList([], []));
  assert.ok(empty, "an empty list still encodes and decodes");
  assert.equal(empty.done.length, 0);
}

// --- archetypes -------------------------------------------------------------------
assert.equal(archetypeFor([]).key, "default", "no data is not a personality");
assert.equal(
  archetypeFor(["food", "food", "food", "travel"]).key,
  "food",
  "a clear majority earns the label",
);
assert.equal(
  archetypeFor(["food", "travel"]).key,
  "default",
  "a tie is not a specialism",
);
assert.equal(
  archetypeFor(["food", "food", "travel", "travel"]).key,
  "default",
  "a near-tie is not a specialism either",
);
assert.equal(
  archetypeFor(["nope", "nope", "nope"]).key,
  "default",
  "an unknown category falls back rather than crashing",
);

console.log("viral: all checks passed");
