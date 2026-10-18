"use client";

import { useState } from "react";
import { Check, Copy, LifeBuoy } from "lucide-react";
import { useMounted } from "@/lib/local-store";
import { exportProgressToken, useDone, useSaved } from "@/lib/progress";
import { shareOrCopy, shareUrl } from "@/lib/share";

/**
 * "Save my list" — the backup link.
 *
 * Sits on the profile because that is where someone is looking at a number they'd hate to
 * lose. Frames it as a lifeboat rather than a feature: the honest reason to click is that
 * localStorage is one cache-clear away from zero, and the in-app browsers these links get
 * opened in have their own storage.
 */
export function SaveMyList() {
  const mounted = useMounted();
  const done = useDone();
  const saved = useSaved();
  const [state, setState] = useState<"idle" | "copied" | "shared" | "failed">("idle");

  const total = done.length + saved.length;
  if (!mounted || total === 0) return null;

  async function onCopy() {
    const url = `${shareUrl("/restore", "restore-link")}&d=${exportProgressToken()}`;
    const result = await shareOrCopy({
      title: "My Tara Bucket list",
      text: "My bucket-list backup link — open this to restore it on another device.",
      url,
    });
    setState(result);
  }

  return (
    <section className="rounded-3xl border border-line bg-cream/50 p-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
        <LifeBuoy size={18} className="text-orange" aria-hidden /> Save my list
      </h2>
      <p className="mt-1.5 text-sm text-muted text-pretty">
        Your {total} {total === 1 ? "entry lives" : "entries live"} in this browser only.
        Clearing your data, switching phones, or opening the site inside Messenger&rsquo;s
        built-in browser all start you from zero. This makes a link that carries the whole
        list &mdash; keep it in your notes or send it to yourself.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {state === "copied" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {state === "copied" ? "Link copied" : "Copy my backup link"}
        </button>
        {state === "copied" && (
          <span role="status" className="text-sm text-muted">
            Paste it somewhere you&rsquo;ll still have next year.
          </span>
        )}
        {state === "failed" && (
          <span role="status" className="text-sm text-muted">
            Couldn&rsquo;t copy — try again, or use a different browser.
          </span>
        )}
      </div>

      <p className="mt-4 text-xs text-faint">
        The link contains the list itself, so it works without an account and nothing is sent
        to us. Anyone with the link can see what you&rsquo;ve ticked.
      </p>
    </section>
  );
}
