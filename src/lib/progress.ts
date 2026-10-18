"use client";

import { useMemo } from "react";
import { readStore, useStoredRaw, writeStore } from "@/lib/local-store";
import { encodeList, mergeEntries } from "@/lib/list-transfer";

/**
 * Reader progress — saved experiences and "I did this" check-offs.
 *
 * Device-local for now, exactly like the bucket-list boards in `local-store.ts`. Phase 0
 * of PLAN.md moves this to Postgres behind magic-link auth; the hook signatures here are
 * the seam that swap happens at, so the UI shouldn't need to change.
 *
 * Each entry carries a denormalized copy of the fields the profile renders (title,
 * region, category). That's what keeps /profile a fully static page — it never has to
 * look an id back up in the database.
 */

const SAVED_KEY = "tb:saved";
const DONE_KEY = "tb:done";

// Lives in a non-client module so server components can read it too; re-exported here so
// existing `from "@/lib/progress"` imports keep working.
export { CATALOG_SIZE } from "@/lib/progress-constants";

export type ProgressEntry = {
  id: string;
  title: string;
  region?: string | null;
  categoryKey?: string;
  /** ISO timestamp, for ordering the profile's recent activity. */
  at: string;
};

function parse(raw: string | null): ProgressEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    // Tolerate anything a previous version (or a hand-edited localStorage) left behind:
    // a malformed entry should cost one row, not blank the whole profile.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is ProgressEntry =>
        !!e && typeof e === "object" && typeof (e as ProgressEntry).id === "string",
    );
  } catch {
    return [];
  }
}

function toggle(key: string, entry: Omit<ProgressEntry, "at">): void {
  const current = parse(readStore(key));
  const next = current.some((e) => e.id === entry.id)
    ? current.filter((e) => e.id !== entry.id)
    : [...current, { ...entry, at: new Date().toISOString() }];
  writeStore(key, JSON.stringify(next));
}

export function toggleSaved(entry: Omit<ProgressEntry, "at">): void {
  toggle(SAVED_KEY, entry);
}

export function toggleDone(entry: Omit<ProgressEntry, "at">): void {
  toggle(DONE_KEY, entry);
}

/** `[]` on the server and during hydration, then the real list. */
export function useSaved(): ProgressEntry[] {
  const raw = useStoredRaw(SAVED_KEY);
  return useMemo(() => parse(raw), [raw]);
}

export function useDone(): ProgressEntry[] {
  const raw = useStoredRaw(DONE_KEY);
  return useMemo(() => parse(raw), [raw]);
}

export function clearProgress(): void {
  writeStore(SAVED_KEY, "[]");
  writeStore(DONE_KEY, "[]");
}

/**
 * Merge a restored list into this device's list.
 *
 * Union rather than overwrite — see `mergeEntries`. Restoring on a phone that already has a
 * few ticks must never be a destructive act, because the person doing it is usually
 * recovering from having already lost something.
 *
 * Returns how many entries were actually new, so the UI can report what happened instead of
 * claiming a generic success.
 */
export function importProgress(
  done: ProgressEntry[],
  saved: ProgressEntry[],
): { addedDone: number; addedSaved: number } {
  const currentDone = parse(readStore(DONE_KEY));
  const currentSaved = parse(readStore(SAVED_KEY));

  const nextDone = mergeEntries(currentDone, done);
  const nextSaved = mergeEntries(currentSaved, saved);

  writeStore(DONE_KEY, JSON.stringify(nextDone));
  writeStore(SAVED_KEY, JSON.stringify(nextSaved));

  return {
    addedDone: nextDone.length - currentDone.length,
    addedSaved: nextSaved.length - currentSaved.length,
  };
}

/** Current list as a shareable token. Reads storage directly so a caller doesn't need hooks. */
export function exportProgressToken(): string {
  return encodeList(parse(readStore(DONE_KEY)), parse(readStore(SAVED_KEY)));
}

/** Counts per bucket, largest first. Used for the profile's region and category rollups. */
export function tally(
  entries: ProgressEntry[],
  field: "region" | "categoryKey",
): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    const value = e[field];
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}
