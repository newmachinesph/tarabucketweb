"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarRange,
  CloudRain,
  ExternalLink,
  Info,
  Plane,
  Wallet,
} from "lucide-react";
import { CategoryPill } from "@/components/ui";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { readStore, writeStore } from "@/lib/local-store";
import {
  AFFILIATE_DISCLOSURE,
  PARTNER_LINK_REL,
  affiliateLinksForDestination,
} from "@/lib/affiliates";
import {
  DESTINATIONS_PLAN,
  MONTHS,
  type IslandGroup,
  type PlannerDestination,
} from "@/lib/planner-data";
import {
  MAX_DESTINATIONS,
  buildPlan,
  planToBucketItems,
  type Budget,
  type Pace,
  type PlanNote,
} from "@/lib/planner";

const ISLAND_GROUPS: IslandGroup[] = ["Luzon", "Visayas", "Mindanao"];

const PACES: { key: Pace; label: string; hint: string }[] = [
  { key: "relaxed", label: "Relaxed", hint: "One real thing a day" },
  { key: "balanced", label: "Balanced", hint: "A main activity plus something small" },
  { key: "packed", label: "Packed", hint: "Dawn starts, full days" },
];

const BUDGETS: { key: Budget; label: string; hint: string }[] = [
  { key: "budget", label: "Budget", hint: "Free and cheap first" },
  { key: "mid", label: "Mid", hint: "The usual tours and trips" },
  { key: "splurge", label: "Splurge", hint: "Diving, charters, the good table" },
];

const NOTE_ICON = {
  season: CloudRain,
  logistics: Plane,
  budget: Wallet,
  pace: Info,
} as const;

const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none ${
        active
          ? "border-transparent bg-ink text-white"
          : "border-line text-ink hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-faint">{label}</p>
      {hint && <p className="mb-3 text-sm text-muted">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </div>
  );
}

export function PlannerClient() {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(["el-nido"]);
  const [days, setDays] = useState(5);
  const [pace, setPace] = useState<Pace>("balanced");
  const [budget, setBudget] = useState<Budget>("mid");
  const [interests, setInterests] = useState<CategoryKey[]>([]);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  const plan = useMemo(
    () => buildPlan({ destinations: picked, days, pace, budget, interests, month }),
    [picked, days, pace, budget, interests, month],
  );

  function toggleDestination(slug: string) {
    setSaved(false);
    setPicked((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length >= MAX_DESTINATIONS
          ? prev
          : [...prev, slug],
    );
  }

  function toggleInterest(key: CategoryKey) {
    setSaved(false);
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function saveAsBucketList() {
    const name = plan.destinations.map((d) => d.name).join(" + ");
    const id = `my-trip-${plan.destinations.map((d) => d.slug).join("-")}-${days}d`;
    const list = {
      id,
      title: `${days} days in ${name}`,
      emoji: "🗺",
      tagalog: "Aking Biyahe",
      accent: "#14A3E1",
      blurb: `A ${pace} ${days}-day plan.`,
      items: planToBucketItems(plan),
    };
    try {
      const raw = readStore("tb:custom");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(parsed) ? parsed : [];
      // Re-saving the same trip should replace it, not stack duplicates in the list.
      writeStore(
        "tb:custom",
        JSON.stringify([...arr.filter((l) => (l as { id?: string })?.id !== id), list]),
      );
    } catch {
      return;
    }
    setSaved(true);
    router.push(`/bucket-list/${id}`);
  }

  const byGroup = ISLAND_GROUPS.map((group) => ({
    group,
    destinations: DESTINATIONS_PLAN.filter((d) => d.islandGroup === group),
  }));

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:items-start">
      {/* ── Controls ── */}
      <aside className="space-y-5 rounded-3xl border border-line bg-cream/40 p-6 lg:sticky lg:top-24">
        <Field
          label="Where"
          hint={`Pick up to ${MAX_DESTINATIONS}. The number shows your route order.`}
        >
          <div className="space-y-4">
            {byGroup.map(({ group, destinations }) => (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold text-faint">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {destinations.map((d) => {
                    const order = picked.indexOf(d.slug);
                    return (
                      <Chip
                        key={d.slug}
                        active={order >= 0}
                        disabled={order < 0 && picked.length >= MAX_DESTINATIONS}
                        onClick={() => toggleDestination(d.slug)}
                      >
                        {order >= 0 && (
                          <span className="mr-1.5 text-xs opacity-70">{order + 1}</span>
                        )}
                        {d.name}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Field>

        <Field label="How long">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={21}
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setSaved(false);
              }}
              aria-label="Trip length in days"
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-orange"
            />
            <span className="w-20 shrink-0 text-right text-sm font-bold text-ink">
              {days} {days === 1 ? "day" : "days"}
            </span>
          </div>
        </Field>

        <Field label="When" hint="Optional — used to flag rain and rough crossings.">
          <select
            value={month ?? ""}
            onChange={(e) => {
              setMonth(e.target.value ? Number(e.target.value) : undefined);
              setSaved(false);
            }}
            className="w-full rounded-2xl border-2 border-line bg-white px-4 py-2.5 text-[15px] font-medium text-ink outline-none focus:border-blue"
          >
            <option value="">Not sure yet</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pace">
          <div className="flex flex-wrap gap-2">
            {PACES.map((p) => (
              <Chip
                key={p.key}
                active={pace === p.key}
                onClick={() => {
                  setPace(p.key);
                  setSaved(false);
                }}
              >
                {p.label}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-xs text-faint">
            {PACES.find((p) => p.key === pace)?.hint}
          </p>
        </Field>

        <Field label="Budget">
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <Chip
                key={b.key}
                active={budget === b.key}
                onClick={() => {
                  setBudget(b.key);
                  setSaved(false);
                }}
              >
                {b.label}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-xs text-faint">
            {BUDGETS.find((b) => b.key === budget)?.hint}
          </p>
        </Field>

        <Field label="Into" hint="Leave empty for a bit of everything.">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip
                key={c.key}
                active={interests.includes(c.key)}
                onClick={() => toggleInterest(c.key)}
              >
                {c.emoji} {c.label}
              </Chip>
            ))}
          </div>
        </Field>
      </aside>

      {/* ── Plan ── */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <h2 className="display text-3xl text-ink sm:text-4xl">
              {days} days in {plan.destinations.map((d) => d.name).join(" + ")}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {plan.days.reduce((n, d) => n + d.experiences.length, 0)} experiences &middot;
              about {peso(plan.totalPhp)} per person in activities
            </p>
          </div>
          <button
            type="button"
            onClick={saveAsBucketList}
            className="rounded-full bg-orange px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-orange-dark active:scale-[0.97]"
          >
            {saved ? "Saved" : "Save as a bucket list"}
          </button>
        </div>

        {plan.notes.length > 0 && (
          <ul className="mt-6 space-y-2">
            {plan.notes.map((note: PlanNote, i) => {
              const Icon = NOTE_ICON[note.kind];
              return (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 text-sm text-muted"
                >
                  <Icon size={16} className="mt-0.5 shrink-0 text-faint" aria-hidden />
                  <span>{note.text}</span>
                </li>
              );
            })}
          </ul>
        )}

        <ol className="mt-8 space-y-5">
          {plan.days.map((day) => (
            <li key={day.day} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-3">
                <h3 className="text-lg font-extrabold text-ink">
                  Day {day.day}
                  <span className="ml-2 font-semibold text-muted">{day.destination.name}</span>
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-faint">
                  {day.isTravelDay && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                      <Plane size={12} aria-hidden /> Travel day
                    </span>
                  )}
                  {day.php > 0 && <span>{peso(day.php)}</span>}
                </div>
              </div>

              {day.experiences.length === 0 ? (
                <p className="pt-4 text-sm text-muted">
                  {day.isTravelDay
                    ? "Getting there. Keep it open — arrivals here rarely run to schedule."
                    : "Nothing scheduled. A free day is a legitimate plan."}
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {day.experiences.map((exp) => (
                    <li key={exp.id} className="flex flex-wrap gap-x-4 gap-y-2 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{exp.title}</p>
                        <p className="mt-0.5 text-sm text-muted text-pretty">{exp.blurb}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-start gap-2">
                        <CategoryPill categoryKey={exp.categoryKey} interactive={false} />
                        <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                          {exp.slot === "short"
                            ? "A couple of hours"
                            : exp.slot === "half-day"
                              ? "Half day"
                              : "Full day"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                          {exp.php === 0 ? "Free" : peso(exp.php)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        <BookTheTrip destinations={plan.destinations} />
      </div>
    </div>
  );
}

/**
 * The affiliate hand-off. A finished itinerary is the moment a partner link is actually
 * useful, which is why it sits at the bottom of the plan rather than beside every line.
 */
function BookTheTrip({ destinations }: { destinations: PlannerDestination[] }) {
  return (
    <section className="mt-10 rounded-3xl border border-line bg-cream/50 p-6">
      <h2 className="text-lg font-extrabold text-ink">Book the pieces</h2>
      <p className="mt-1 text-sm text-muted">
        We don&rsquo;t sell trips. These search our partners for tours, rooms, and boats in
        each place on your plan.
      </p>

      <div className="mt-5 space-y-5">
        {destinations.map((d) => (
          <div key={d.slug}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
              <CalendarRange size={15} className="text-faint" aria-hidden />
              {d.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {affiliateLinksForDestination(d.name).map(({ partner, href, label }) => (
                <a
                  key={partner.key}
                  href={href}
                  target="_blank"
                  rel={PARTNER_LINK_REL}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:text-orange"
                >
                  {label}
                  <span className="text-xs font-medium text-faint">{partner.name}</span>
                  <ExternalLink size={13} aria-hidden />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-line pt-3 text-xs text-faint">
        {AFFILIATE_DISCLOSURE}
      </p>
    </section>
  );
}
