"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Info, Plane, Share2 } from "lucide-react";
import {
  HOLIDAYS_2027,
  bridgeMonth,
  efficiency,
  findBridges,
  formatDay,
  type Bridge,
} from "@/lib/holidays";
import { DESTINATIONS_PLAN, type PlannerDestination } from "@/lib/planner-data";
import { shareOrCopy, shareText, shareUrl } from "@/lib/share";

/**
 * Bridge Hunter — the long-weekend optimizer from VIRAL.md.
 *
 * Filipinos plan around holiday "bridges" (file one day, get four), and the annual
 * Malacañang proclamation is a guaranteed national news moment where every newsroom
 * publishes the same static list. This is the interactive answer to that list.
 *
 * Rendered as a client component but computed in `useMemo`, so the server still emits the
 * default view as real HTML — the page is crawlable and citable, not an empty shell that
 * fills in after hydration.
 */

const LEAVE_OPTIONS = [0, 1, 2, 3, 5] as const;
const YEAR = 2027;

/** Destinations whose best months cover the month this stretch falls in. */
function matchDestinations(bridge: Bridge, limit = 3): PlannerDestination[] {
  const month = bridgeMonth(bridge);
  const inSeason = DESTINATIONS_PLAN.filter((d) => d.bestMonths.includes(month));
  const pool = inSeason.length > 0 ? inSeason : DESTINATIONS_PLAN;

  // Longer stretches deserve destinations that are actually worth the airfare; short ones
  // shouldn't suggest a place that needs five days. Rank by how close the suggested stay is
  // to the days available, then keep it stable so the list doesn't reshuffle on re-render.
  return [...pool]
    .sort((a, b) => {
      const fit = Math.abs(a.suggestedDays - bridge.length) - Math.abs(b.suggestedDays - bridge.length);
      return fit !== 0 ? fit : a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function BridgeHunter() {
  const [maxLeave, setMaxLeave] = useState<number>(2);
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");

  const bridges = useMemo(
    () => findBridges(HOLIDAYS_2027, maxLeave, YEAR).sort((a, b) => b.length - a.length || a.start.localeCompare(b.start)),
    [maxLeave],
  );

  const totalDaysOff = bridges.reduce((sum, b) => sum + b.length, 0);
  const totalLeave = bridges.reduce((sum, b) => sum + b.leaveDays.length, 0);

  async function onShare() {
    const best = bridges[0];
    const result = await shareOrCopy({
      title: "Bridge Hunter — Tara Bucket",
      text: shareText({
        headline: `My ${YEAR} long-weekend plan: ${bridges.length} trips, ${totalDaysOff} days off for ${totalLeave} days of leave.`,
        detail: best ? `Longest: ${best.length} days from ${formatDay(best.start)}.` : undefined,
      }),
      url: shareUrl("/long-weekends", "bridge-plan"),
    });
    setShareState(result);
  }

  return (
    <div>
      {/* Controls */}
      <div className="rounded-3xl border border-line bg-cream/50 p-6">
        <fieldset>
          <legend className="text-sm font-bold text-ink">
            How many leave days can you file?
          </legend>
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Leave days">
            {LEAVE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={maxLeave === n}
                onClick={() => setMaxLeave(n)}
                className={`rounded-full border-2 px-5 py-2.5 text-sm font-bold transition-colors ${
                  maxLeave === n
                    ? "border-transparent bg-ink text-white"
                    : "border-line text-ink hover:border-ink/30"
                }`}
              >
                {n === 0 ? "None" : n}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          {bridges.length > 0 ? (
            <>
              <strong className="text-ink">
                {bridges.length} long weekends in {YEAR}
              </strong>{" "}
              — {totalDaysOff} days off for {totalLeave} {totalLeave === 1 ? "day" : "days"} of
              filed leave.
            </>
          ) : (
            <>No stretches of three days or more with that much leave.</>
          )}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
        >
          <Share2 size={16} aria-hidden /> Share my {YEAR} plan
        </button>
        {shareState === "copied" && (
          <span role="status" className="text-sm font-semibold text-green">
            Copied — drop it in the office GC.
          </span>
        )}
      </div>

      {/* Bridges */}
      <ol className="mt-8 space-y-5">
        {bridges.map((b) => (
          <BridgeCard key={b.start} bridge={b} />
        ))}
      </ol>
    </div>
  );
}

function BridgeCard({ bridge }: { bridge: Bridge }) {
  const destinations = matchDestinations(bridge);
  const eff = efficiency(bridge);

  return (
    <li className="rounded-3xl border border-line bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-faint">
            <CalendarDays size={15} aria-hidden />
            {formatDay(bridge.start)} &ndash; {formatDay(bridge.end)}
          </p>
          <p className="display mt-1 text-4xl text-ink">
            {bridge.length} days off
          </p>
        </div>
        <div className="text-right">
          {bridge.leaveDays.length === 0 ? (
            <span className="inline-block rounded-full bg-green/10 px-3 py-1.5 text-sm font-bold text-green">
              No leave needed
            </span>
          ) : (
            <>
              <p className="text-sm font-semibold text-muted">
                File {bridge.leaveDays.length}{" "}
                {bridge.leaveDays.length === 1 ? "day" : "days"}
              </p>
              {Number.isFinite(eff) && (
                <p className="text-xs text-faint">{eff.toFixed(1)} days off per day filed</p>
              )}
            </>
          )}
        </div>
      </div>

      {bridge.leaveDays.length > 0 && (
        <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm text-ink">
          <span className="font-semibold">File leave on:</span>{" "}
          {bridge.leaveDays.map(formatDay).join(", ")}
        </p>
      )}

      <ul className="mt-4 flex flex-wrap gap-2">
        {bridge.holidays.map((h) => (
          <li
            key={h.date}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              h.status === "law" ? "bg-ink/5 text-ink" : "bg-orange/10 text-orange-dark"
            }`}
            title={h.note ?? (h.status === "law" ? "Fixed by law" : "Set by proclamation")}
          >
            {h.name}
            {h.status !== "law" && <span aria-hidden> *</span>}
            <span className="sr-only">
              {h.status === "law" ? " (fixed by law)" : " (not yet confirmed — set by proclamation)"}
            </span>
          </li>
        ))}
      </ul>

      {bridge.provisional && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-faint">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Starred days aren&rsquo;t fixed in law — they depend on the {YEAR} proclamation and
            can shift. Confirm before you file.
          </span>
        </p>
      )}

      {destinations.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-faint">
            <Plane size={13} aria-hidden /> In season, and worth the days
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/destinations/${d.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-line px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-ink/20"
                >
                  <span className="font-semibold text-ink group-hover:text-orange">{d.name}</span>
                  <span className="mt-0.5 text-xs text-faint">
                    {d.suggestedDays} days · {d.region}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
