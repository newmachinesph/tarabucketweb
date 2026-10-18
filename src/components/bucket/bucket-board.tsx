"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Download, Share2, RotateCcw } from "lucide-react";
import { useMounted, useStoredRaw, writeStore } from "@/lib/local-store";

export type BucketList = {
  id: string;
  title: string;
  emoji: string;
  tagalog?: string;
  accent: string;
  blurb?: string;
  items: string[];
};

const KEY = (id: string) => `tb:checks:${id}`;

export function BucketBoard({ list }: { list: BucketList }) {
  const [busy, setBusy] = useState<"" | "download" | "share">("");
  const [toast, setToast] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const mounted = useMounted();
  const raw = useStoredRaw(KEY(list.id));
  const checked = useMemo<Set<number>>(() => {
    try {
      return new Set(raw ? (JSON.parse(raw) as number[]) : []);
    } catch {
      return new Set();
    }
  }, [raw]);

  function persist(next: Set<number>) {
    writeStore(KEY(list.id), JSON.stringify([...next]));
  }

  function toggle(i: number) {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    persist(next);
  }

  function reset() {
    persist(new Set());
  }

  const done = checked.size;
  const total = list.items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  async function render(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  async function download() {
    setBusy("download");
    try {
      const blob = await render();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tara-bucket-${list.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
      flash("Saved to your device 📥");
    } catch {
      flash("Could not save. Try again?");
    } finally {
      setBusy("");
    }
  }

  async function share() {
    setBusy("share");
    try {
      const blob = await render();
      if (!blob) return;
      const file = new File([blob], `tara-bucket-${list.id}.png`, { type: "image/png" });
      const shareText = `My "${list.title}" bucket list on Tara Bucket - ${done}/${total} done! 🪣`;
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: list.title,
          text: shareText,
        });
      } else {
        // Desktop fallback: download the image + copy a caption.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tara-bucket-${list.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
        try {
          await navigator.clipboard.writeText(shareText);
        } catch {}
        flash("Image saved + caption copied. Post it! 🚀");
      }
    } catch {
      // user cancelled share — ignore
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Exportable flashcard */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-[1.75rem] p-7"
        style={{
          background: `linear-gradient(160deg, ${list.accent}14, #ffffff 42%)`,
          border: "1px solid rgba(14,23,38,0.08)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl"
          style={{ background: list.accent }}
        />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-4xl">{list.emoji}</span>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-ink">
                {list.title}
              </h2>
              {list.tagalog && (
                <p className="text-sm font-semibold" style={{ color: list.accent }}>
                  {list.tagalog}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold" style={{ color: list.accent }}>
                {done}/{total}
              </p>
              <p className="text-xs font-semibold text-faint">done</p>
            </div>
          </div>

          {/* progress bar */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink/5">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: list.accent }}
            />
          </div>

          <ul className="mt-5 space-y-2.5">
            {list.items.map((item, i) => {
              const on = checked.has(i);
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-colors"
                      style={{
                        borderColor: on ? list.accent : "rgba(14,23,38,0.18)",
                        background: on ? list.accent : "transparent",
                      }}
                    >
                      {on && <Check size={14} className="text-white" strokeWidth={3} />}
                    </span>
                    <span
                      className={`text-[15px] font-medium ${on ? "text-faint line-through" : "text-ink"}`}
                    >
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm font-extrabold text-ink">
              tara<span style={{ color: list.accent }}>!</span> bucket
            </span>
            <span className="text-xs font-medium text-faint">tarabucket.ph</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={share}
          disabled={!mounted || busy !== ""}
          className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-dark active:scale-95 disabled:opacity-50"
        >
          <Share2 size={16} /> {busy === "share" ? "Preparing…" : "Share"}
        </button>
        <button
          onClick={download}
          disabled={!mounted || busy !== ""}
          className="inline-flex items-center gap-2 rounded-full border-2 border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-50"
        >
          <Download size={16} /> {busy === "download" ? "Saving…" : "Download"}
        </button>
        <button
          onClick={reset}
          disabled={!mounted || done === 0}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface disabled:opacity-40"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {toast && (
        <p className="mt-3 text-center text-sm font-semibold text-green">{toast}</p>
      )}
      <p className="mt-2 text-center text-xs text-faint">
        Your progress saves on this device. No sign-up needed.
      </p>
    </div>
  );
}
