"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, RotateCcw, Share2, X } from "lucide-react";
import { categoryColor, categoryLabel } from "@/lib/categories";
import { toggleDone, useDone } from "@/lib/progress";
import { CATALOG_SIZE } from "@/lib/progress-constants";
import { useMounted } from "@/lib/local-store";
// From `quiz-shared`, not `quiz` — the latter is server-only and would pull the database
// module into the browser bundle.
import { archetypeFor, type QuizItem } from "@/lib/quiz-shared";
import { shareOrCopy, shareText, shareUrl } from "@/lib/share";

/**
 * The 879 Quiz — VIRAL.md's activation keystone.
 *
 * The job is narrow and load-bearing: someone who saw a friend's score has to get their own
 * comparable number in under two minutes, with no signup. Three design consequences:
 *
 *  - **The quiz is the onboarding.** Every "done" tap writes a real entry to the same
 *    localStorage list the rest of the site reads, so finishing leaves a started bucket list
 *    behind rather than a disposable score. That is the difference between a funnel and a
 *    gimmick.
 *  - **No invented statistics.** No "you're in the top 18%" until real check-off data exists.
 *    Fiction dressed as data is the one thing that would cost the editorial trust the whole
 *    business runs on.
 *  - **Answers are held locally until the end.** Writing on every tap would mean a
 *    half-finished quiz silently mutating someone's existing list, and would make going back
 *    a destructive act.
 */

type Answers = Record<string, boolean>;

export function QuizClient({ items }: { items: QuizItem[] }) {
  const mounted = useMounted();
  const alreadyDone = useDone();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [finished, setFinished] = useState(false);

  const total = items.length;
  const current = items[index];

  function answer(done: boolean) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: done }));
    if (index + 1 >= total) setFinished(true);
    else setIndex(index + 1);
  }

  function back() {
    if (index > 0) setIndex(index - 1);
  }

  function restart() {
    setAnswers({});
    setIndex(0);
    setFinished(false);
  }

  if (total === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-line px-6 py-16 text-center text-muted">
        The quiz is warming up — no items available right now.
      </p>
    );
  }

  if (finished) {
    return (
      <QuizResult
        items={items}
        answers={answers}
        alreadyDoneIds={new Set(alreadyDone.map((e) => e.id))}
        onRestart={restart}
      />
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between text-sm font-semibold">
          <span className="text-faint">
            {index + 1} of {total}
          </span>
          <span className="text-orange">{Object.values(answers).filter(Boolean).length} done</span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/5"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Quiz progress"
        >
          <div
            className="h-full rounded-full bg-ink transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: categoryColor(current!.categoryKey) }}
        >
          {categoryLabel(current!.categoryKey)}
        </span>
        <h2 className="display mt-3 text-3xl leading-tight text-ink sm:text-4xl">
          {current!.title}
        </h2>
        <p className="mt-3 text-muted">
          {[current!.place, current!.province, current!.region].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => answer(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green px-5 py-4 text-base font-bold text-white transition-transform active:scale-[0.98]"
          >
            <Check size={20} strokeWidth={3} aria-hidden /> Done it
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-line px-5 py-4 text-base font-bold text-ink transition-colors hover:bg-surface active:scale-[0.98]"
          >
            <X size={20} strokeWidth={3} aria-hidden /> Not yet
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="text-sm font-semibold text-muted transition-colors hover:text-orange disabled:opacity-40"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={() => setFinished(true)}
          className="text-sm font-semibold text-faint transition-colors hover:text-ink"
        >
          Skip to my score
        </button>
      </div>

      {!mounted && (
        <p className="mt-4 text-xs text-faint">Loading your existing list&hellip;</p>
      )}
    </div>
  );
}

function QuizResult({
  items,
  answers,
  alreadyDoneIds,
  onRestart,
}: {
  items: QuizItem[];
  answers: Answers;
  alreadyDoneIds: Set<string>;
  onRestart: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");

  const doneItems = useMemo(
    () => items.filter((i) => answers[i.id]),
    [items, answers],
  );
  const answeredCount = Object.keys(answers).length;
  const archetype = archetypeFor(doneItems.map((i) => i.categoryKey));

  const regions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of doneItems) {
      if (!i.region) continue;
      counts.set(i.region, (counts.get(i.region) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [doneItems]);

  /** Write the ticked items into the real list — this is what makes the quiz onboarding. */
  function saveToList() {
    for (const item of doneItems) {
      if (alreadyDoneIds.has(item.id)) continue; // toggle would un-tick it
      toggleDone({
        id: item.id,
        title: item.title,
        region: item.region,
        categoryKey: item.categoryKey,
      });
    }
    setSaved(true);
  }

  async function onShare() {
    const url = shareUrl("/quiz", "quiz-result");
    const result = await shareOrCopy({
      title: "Tara Bucket",
      text: shareText({
        headline: `I've done ${doneItems.length} of ${items.length} Philippine bucket-list icons.`,
        detail: `${archetype.label}. How many have you done?`,
      }),
      url,
    });
    setShareState(result);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-line bg-cream/60 p-7 text-center sm:p-10">
        <p className="kicker text-orange">Your score</p>
        <p className="display mt-3 text-7xl text-ink sm:text-8xl">
          {doneItems.length}
          <span className="text-3xl text-muted"> / {items.length}</span>
        </p>
        <p className="mt-4 text-xl font-extrabold text-ink">{archetype.label}</p>
        <p className="mx-auto mt-1 max-w-md text-muted text-pretty">{archetype.blurb}</p>

        {answeredCount < items.length && (
          <p className="mt-4 text-xs text-faint">
            Scored on the {answeredCount} you answered.
          </p>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Share2 size={17} aria-hidden /> Share my score
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-full border-2 border-line px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            <RotateCcw size={16} aria-hidden /> Start over
          </button>
        </div>
        {shareState === "copied" && (
          <p role="status" className="mt-3 text-sm font-semibold text-green">
            Link copied — paste it in your group chat.
          </p>
        )}
        {shareState === "failed" && (
          <p role="status" className="mt-3 text-sm text-faint">
            Couldn&rsquo;t open the share sheet — copy the address bar instead.
          </p>
        )}
      </div>

      {regions.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-faint">
            Where you&rsquo;ve been
          </h2>
          <ul className="flex flex-wrap gap-2">
            {regions.map(([region, count]) => (
              <li
                key={region}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink"
              >
                {region} <span className="text-faint">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The actual conversion step: turn a score into a started bucket list. */}
      <section className="rounded-3xl border border-line bg-white p-6">
        {saved ? (
          <>
            <h2 className="text-lg font-extrabold text-ink">Saved to your bucket list.</h2>
            <p className="mt-1 text-sm text-muted">
              {doneItems.length} ticked off, out of {CATALOG_SIZE.toLocaleString()} in the
              catalog. It&rsquo;s stored on this device — no sign-up.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
              >
                See your progress
              </Link>
              <Link
                href="/explore"
                className="rounded-full border-2 border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
              >
                Find your next one
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-extrabold text-ink">Keep this as your bucket list?</h2>
            <p className="mt-1 text-sm text-muted">
              Saves the {doneItems.length} you&rsquo;ve ticked to this device, so you can build
              on them instead of starting from zero. No sign-up.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveToList}
                disabled={doneItems.length === 0}
                className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-40"
              >
                Save my {doneItems.length}
              </button>
              <Link
                href="/destinations"
                className="rounded-full border-2 border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
              >
                Browse destinations
              </Link>
            </div>
          </>
        )}
      </section>

      {doneItems.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-faint">
            What you ticked
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {doneItems.map((i) => (
              <li key={i.id}>
                <Link
                  href={`/experience/${i.id}`}
                  className="group flex h-full flex-col gap-0.5 rounded-2xl border border-line bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <span className="font-semibold text-ink group-hover:text-orange">{i.title}</span>
                  <span className="text-xs text-faint">
                    {[i.place, i.region].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
