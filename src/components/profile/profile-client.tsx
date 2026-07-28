"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Check, MapPin, Trash2 } from "lucide-react";
import { CategoryPill } from "@/components/ui";
import { categoryLabel } from "@/lib/categories";
import { useMounted } from "@/lib/local-store";
import {
  CATALOG_SIZE,
  clearProgress,
  tally,
  useDone,
  useSaved,
  type ProgressEntry,
} from "@/lib/progress";

/** Newest first. Entries written before `at` existed sort last rather than crashing. */
function recent(entries: ProgressEntry[]): ProgressEntry[] {
  return [...entries].sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
}

export function ProfileClient() {
  const mounted = useMounted();
  const done = useDone();
  const saved = useSaved();
  const [confirming, setConfirming] = useState(false);

  if (!mounted) {
    // Progress lives in localStorage, so there is nothing truthful to render server-side.
    return (
      <div className="rounded-3xl border border-dashed border-line py-20 text-center">
        <p className="text-sm text-muted">Loading your progress&hellip;</p>
      </div>
    );
  }

  if (done.length === 0 && saved.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line px-6 py-20 text-center">
        <p className="text-lg font-semibold text-ink">Nothing ticked off yet.</p>
        <p className="mx-auto mt-2 max-w-md text-muted text-pretty">
          Mark an experience as done, or save one for later, and it&rsquo;ll show up here
          &mdash; along with how much of the archipelago you&rsquo;ve covered.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/explore"
            className="rounded-full bg-orange px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-orange-dark"
          >
            Browse experiences
          </Link>
          <Link
            href="/plan"
            className="rounded-full border-2 border-line px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            Plan a trip
          </Link>
        </div>
      </div>
    );
  }

  const pct = Math.round((done.length / CATALOG_SIZE) * 1000) / 10;
  const regions = tally(done, "region");
  const categories = tally(done, "categoryKey");

  return (
    <div className="space-y-10">
      {/* Headline progress */}
      <section className="rounded-3xl border border-line bg-cream/50 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-faint">
              Your bucket list
            </p>
            <p className="display mt-2 text-5xl text-ink sm:text-6xl">
              {done.length}
              <span className="text-2xl text-muted"> / {CATALOG_SIZE.toLocaleString()}</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              {pct < 0.1 ? "Just getting started" : `${pct}% of the catalog`}
              {saved.length > 0 && ` · ${saved.length} saved for later`}
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-2xl font-extrabold text-ink">{regions.length}</p>
              <p className="text-xs font-semibold text-faint">
                {regions.length === 1 ? "region" : "regions"}
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-ink">{categories.length}</p>
              <p className="text-xs font-semibold text-faint">
                {categories.length === 1 ? "category" : "categories"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-ink/5">
          <div
            className="h-full rounded-full bg-orange transition-all duration-500"
            // A single tick out of 879 rounds to nothing, so the bar keeps a visible floor.
            style={{ width: `${Math.max(done.length ? 1.5 : 0, pct)}%` }}
          />
        </div>
      </section>

      {/* Rollups */}
      {(regions.length > 0 || categories.length > 0) && (
        <section className="grid gap-6 sm:grid-cols-2">
          {regions.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-faint">
                By region
              </h2>
              <ul className="space-y-2">
                {regions.map((r) => (
                  <li
                    key={r.key}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-[15px] font-medium text-ink">
                      <MapPin size={14} className="shrink-0 text-faint" aria-hidden />
                      <span className="truncate">{r.key}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-orange">{r.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {categories.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-faint">
                By category
              </h2>
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li
                    key={c.key}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-2.5"
                  >
                    <CategoryPill categoryKey={c.key} interactive={false} />
                    <span className="shrink-0 text-sm font-bold text-orange">{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <EntryList
        title="Done"
        icon={<Check size={14} strokeWidth={3} aria-hidden />}
        entries={recent(done)}
        emptyText="Nothing marked done yet."
      />

      <EntryList
        title="Saved for later"
        icon={<Bookmark size={14} aria-hidden />}
        entries={recent(saved)}
        emptyText="Nothing saved yet."
      />

      <section className="border-t border-line pt-6">
        <p className="text-sm text-muted">
          This is stored on this device only &mdash; clearing your browser data clears it.
          Accounts that sync across devices are on the way.
        </p>
        <div className="mt-3">
          {confirming ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-ink">
                Erase all {done.length + saved.length} entries?
              </span>
              <button
                type="button"
                onClick={() => {
                  clearProgress();
                  setConfirming(false);
                }}
                className="rounded-full bg-red px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Yes, erase
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-line px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-red/40 hover:text-red"
            >
              <Trash2 size={15} aria-hidden /> Clear my progress
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function EntryList({
  title,
  icon,
  entries,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  entries: ProgressEntry[];
  emptyText: string;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-faint">
        <span className="text-ink">{icon}</span>
        {title} <span className="text-faint">({entries.length})</span>
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {entries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/experience/${e.id}`}
                className="group flex h-full flex-col justify-between gap-1 rounded-2xl border border-line bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
              >
                <span className="font-semibold text-ink group-hover:text-orange">
                  {e.title}
                </span>
                <span className="text-xs text-faint">
                  {[e.region, e.categoryKey ? categoryLabel(e.categoryKey) : null]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
