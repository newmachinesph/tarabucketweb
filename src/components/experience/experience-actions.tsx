"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, Check, Circle } from "lucide-react";
import { useMounted } from "@/lib/local-store";
import { toggleDone, toggleSaved, useDone, useSaved, type ProgressEntry } from "@/lib/progress";

type Item = Pick<ProgressEntry, "id" | "title" | "region"> & { categoryKey?: string };

/**
 * Save / mark-done toggles for one experience. Progress is device-local (see
 * `lib/progress.ts`), so this renders in its resting state until hydration — disabled
 * rather than wrong, which avoids a toggle that flips under the reader's finger.
 */
export function ExperienceActions({ item }: { item: Item }) {
  const mounted = useMounted();
  const saved = useSaved();
  const done = useDone();

  const isSaved = mounted && saved.some((e) => e.id === item.id);
  const isDone = mounted && done.some((e) => e.id === item.id);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggleDone(item)}
          disabled={!mounted}
          aria-pressed={isDone}
          className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 ${
            isDone
              ? "border-transparent bg-green text-white"
              : "border-line text-ink hover:border-ink/30 hover:bg-surface"
          }`}
        >
          {isDone ? <Check size={16} strokeWidth={3} /> : <Circle size={16} />}
          {isDone ? "Done" : "I've done this"}
        </button>

        <button
          type="button"
          onClick={() => toggleSaved(item)}
          disabled={!mounted}
          aria-pressed={isSaved}
          className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50 ${
            isSaved
              ? "border-transparent bg-ink text-white"
              : "border-line text-ink hover:border-ink/30 hover:bg-surface"
          }`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {isSaved ? "Saved" : "Save for later"}
        </button>
      </div>

      <p className="mt-3 text-xs text-faint">
        Saved on this device, no sign-up needed.{" "}
        <Link href="/profile" className="font-semibold text-muted underline underline-offset-2 hover:text-orange">
          See your progress
        </Link>
      </p>
    </div>
  );
}
