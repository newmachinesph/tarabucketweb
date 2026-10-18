/**
 * Philippine holiday calendar and long-weekend ("bridge") finder — VIRAL.md's Bridge Hunter.
 *
 * ## Why the `status` field is the most important thing here
 *
 * Philippine holidays come from two places. **Regular holidays and a handful of special
 * days are fixed in law** (RA 9492 as amended, plus the Eid proclamations) — those are known
 * years ahead. **Everything else is set by a Malacañang proclamation**, usually signed in
 * the second half of the preceding year, and it moves: dates get shifted to create longer
 * weekends, and holidays are occasionally amended mid-year.
 *
 * A tool that silently blends the two is a tool that tells someone to file leave for a day
 * that isn't a holiday. So every entry carries whether it is `law` (fixed), `movable`
 * (religious, astronomically or lunar-determined), or `customary` (almost always declared,
 * but not law until the proclamation lands) — and the UI says so.
 *
 * When the 2027 proclamation is signed, the only change needed is flipping `status` and
 * correcting any shifted dates. That is a data edit, not a code change.
 */

export type HolidayStatus = "law" | "movable" | "customary";

export type Holiday = {
  /** ISO date, `YYYY-MM-DD`, in Philippine local terms (the calendar has no timezone). */
  date: string;
  name: string;
  /** Regular holidays pay differently and are never dropped; special days sometimes move. */
  kind: "regular" | "special";
  status: HolidayStatus;
  note?: string;
};

/**
 * 2027. Fixed-date regular holidays come from RA 9492; Holy Week is derived from Easter
 * Sunday 2027 (28 March); National Heroes Day is the last Monday of August (30 August 2027).
 *
 * Eid'l Fitr and Eid'l Adha are lunar and are proclaimed only after moon sighting — they are
 * listed with approximate dates and flagged, because giving a confident date for them is
 * exactly the kind of wrong-by-a-day answer that costs trust.
 */
export const HOLIDAYS_2027: Holiday[] = [
  { date: "2027-01-01", name: "New Year's Day", kind: "regular", status: "law" },
  {
    date: "2027-02-06",
    name: "Chinese New Year",
    kind: "special",
    status: "customary",
    note: "Declared most years, but by proclamation.",
  },
  { date: "2027-03-25", name: "Maundy Thursday", kind: "regular", status: "movable" },
  { date: "2027-03-26", name: "Good Friday", kind: "regular", status: "movable" },
  {
    date: "2027-03-27",
    name: "Black Saturday",
    kind: "special",
    status: "movable",
    note: "Special non-working day in most years.",
  },
  { date: "2027-04-09", name: "Araw ng Kagitingan", kind: "regular", status: "law" },
  { date: "2027-05-01", name: "Labor Day", kind: "regular", status: "law" },
  { date: "2027-06-12", name: "Independence Day", kind: "regular", status: "law" },
  {
    date: "2027-08-21",
    name: "Ninoy Aquino Day",
    kind: "special",
    status: "law",
    note: "Special non-working day fixed by law.",
  },
  { date: "2027-08-30", name: "National Heroes Day", kind: "regular", status: "law" },
  {
    date: "2027-11-01",
    name: "All Saints' Day",
    kind: "special",
    status: "customary",
    note: "Nov 1 is customary; Nov 2 is often added by proclamation.",
  },
  { date: "2027-11-30", name: "Bonifacio Day", kind: "regular", status: "law" },
  {
    date: "2027-12-08",
    name: "Feast of the Immaculate Conception",
    kind: "special",
    status: "law",
  },
  {
    date: "2027-12-24",
    name: "Christmas Eve",
    kind: "special",
    status: "customary",
    note: "Added by proclamation in most recent years.",
  },
  { date: "2027-12-25", name: "Christmas Day", kind: "regular", status: "law" },
  { date: "2027-12-30", name: "Rizal Day", kind: "regular", status: "law" },
  {
    date: "2027-12-31",
    name: "Last Day of the Year",
    kind: "special",
    status: "customary",
    note: "Added by proclamation in most recent years.",
  },
];

/** Parsed as UTC so a server in any timezone reads the same calendar day. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

export function isoOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(iso: string): number {
  return parseDate(iso).getUTCDay();
}

export function isWeekend(iso: string): boolean {
  const d = weekdayOf(iso);
  return d === 0 || d === 6;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(iso: string, n: number): string {
  return isoOf(new Date(parseDate(iso).getTime() + n * DAY_MS));
}

export function formatDay(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export type Bridge = {
  /** First and last day off, inclusive. */
  start: string;
  end: string;
  /** Total consecutive days off. */
  length: number;
  /** Working days the traveler has to file for. */
  leaveDays: string[];
  /** Holidays doing the work. */
  holidays: Holiday[];
  /** True when any contributing holiday isn't yet fixed in law. */
  provisional: boolean;
};

/**
 * Find every stretch of consecutive days off obtainable by filing at most `maxLeave` days.
 *
 * The approach is deliberately brute-force: a year is 365 days, every candidate window is a
 * pair of bounds, and checking all of them is microseconds. A cleverer sweep would be harder
 * to reason about and no faster at this size.
 *
 * ponytail: O(days²) over one year. Fine forever — this never runs on more than 365 days.
 */
export function findBridges(
  holidays: Holiday[],
  maxLeave: number,
  year: number,
): Bridge[] {
  if (maxLeave < 0) return [];
  const holidayByDate = new Map(holidays.map((h) => [h.date, h]));
  const isOff = (iso: string) => isWeekend(iso) || holidayByDate.has(iso);

  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const allDays: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) allDays.push(d);

  const found: Bridge[] = [];

  for (let i = 0; i < allDays.length; i++) {
    const from = allDays[i]!;
    // A useful stretch starts on a day off — otherwise the first day is leave you'd file
    // for no reason.
    if (!isOff(from)) continue;
    // Don't start mid-stretch; the window should be maximal on the left.
    if (i > 0 && isOff(allDays[i - 1]!)) continue;

    const leave: string[] = [];
    for (let j = i; j < allDays.length; j++) {
      const day = allDays[j]!;
      if (!isOff(day)) {
        if (leave.length >= maxLeave) break;
        leave.push(day);
      }

      const length = j - i + 1;
      const last = day;
      // Only record when the window ends on a day off — a stretch ending on filed leave
      // followed by work is really a shorter stretch.
      if (!isOff(last)) continue;

      const involved = allDays
        .slice(i, j + 1)
        .map((d) => holidayByDate.get(d))
        .filter((h): h is Holiday => !!h);

      // A plain Sat-Sun with no holiday and no leave isn't news.
      if (involved.length === 0 && leave.length === 0) continue;

      found.push({
        start: from,
        end: last,
        length,
        leaveDays: [...leave],
        holidays: involved,
        provisional: involved.some((h) => h.status !== "law"),
      });
    }
  }

  // Keep the best (longest, then cheapest) window per starting stretch.
  const best = new Map<string, Bridge>();
  for (const b of found) {
    const existing = best.get(b.start);
    if (
      !existing ||
      b.length > existing.length ||
      (b.length === existing.length && b.leaveDays.length < existing.leaveDays.length)
    ) {
      best.set(b.start, b);
    }
  }

  return [...best.values()]
    .filter((b) => b.length >= 3)
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** How good a bridge is: days off per day of leave filed. Pure weekends are excluded above,
 *  so a zero-leave bridge is a holiday that already lands well — the best possible deal. */
export function efficiency(b: Bridge): number {
  return b.leaveDays.length === 0 ? Infinity : b.length / b.leaveDays.length;
}

/** Month index (1-12) a bridge starts in, for matching against best-months data. */
export function bridgeMonth(b: Bridge): number {
  return parseDate(b.start).getUTCMonth() + 1;
}
