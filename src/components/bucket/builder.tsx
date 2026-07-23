"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { readStore, writeStore } from "@/lib/local-store";

const EMOJIS = ["🪣", "🏝", "🍢", "🎉", "🧗", "🌋", "🍲", "⛩️", "🏄", "☕", "🛶", "🏔"];
const ACCENTS = ["#14A3E1", "#FF5A36", "#FF4D67", "#22C58B", "#7C4DFF", "#0EA5A5", "#F4B740"];

export function Builder() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🪣");
  const [accent, setAccent] = useState("#14A3E1");
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function addItem() {
    const t = draft.trim();
    if (!t) return;
    setItems((v) => [...v, t]);
    setDraft("");
  }

  function create() {
    const slug =
      title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
      "list";
    const id = `my-${slug}-${Math.random().toString(36).slice(2, 6)}`;
    const list = {
      id,
      title: title.trim() || "My Bucket List",
      emoji,
      tagalog: "Aking Listahan",
      accent,
      blurb: "",
      items,
    };
    try {
      const raw = readStore("tb:custom");
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(list);
      writeStore("tb:custom", JSON.stringify(arr));
    } catch {}
    router.push(`/bucket-list/${id}`);
  }

  const canCreate = title.trim().length > 1 && items.length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Form */}
      <div className="space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink">List title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My dream Palawan trip"
            className="w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg font-semibold text-ink outline-none focus:border-blue"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`grid h-11 w-11 place-items-center rounded-xl text-xl transition-all ${
                    emoji === e ? "bg-ink scale-105" : "bg-surface hover:bg-ink/5"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-ink">Color</label>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  aria-label={`accent ${c}`}
                  className={`h-11 w-11 rounded-xl transition-transform ${accent === c ? "scale-110 ring-2 ring-ink ring-offset-2" : ""}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink">
            Add items ({items.length})
          </label>
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              placeholder="e.g. Watch the sunset at Nacpan Beach"
              className="w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-ink outline-none focus:border-blue"
            />
            <button
              onClick={addItem}
              className="shrink-0 rounded-2xl bg-ink px-4 text-white transition-colors hover:bg-ink/85"
              aria-label="Add item"
            >
              <Plus size={20} />
            </button>
          </div>
          {items.length > 0 && (
            <ul className="mt-4 space-y-2">
              {items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-2.5"
                >
                  <span className="text-[15px] font-medium text-ink">{it}</span>
                  <button
                    onClick={() => setItems((v) => v.filter((_, x) => x !== i))}
                    className="text-faint hover:text-red"
                    aria-label="Remove"
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={create}
          disabled={!canCreate}
          className="rounded-full bg-orange px-7 py-3.5 font-semibold text-white transition-all hover:bg-orange-dark active:scale-95 disabled:opacity-50"
        >
          Create my list
        </button>
        {!canCreate && (
          <p className="text-sm text-faint">Add a title and at least one item.</p>
        )}
      </div>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-faint">
          Live preview
        </p>
        <div
          className="overflow-hidden rounded-[1.75rem] p-6"
          style={{ background: `linear-gradient(160deg, ${accent}14, #ffffff 42%)`, border: "1px solid rgba(14,23,38,0.08)" }}
        >
          <span className="text-4xl">{emoji}</span>
          <h3 className="mt-2 text-xl font-extrabold text-ink">
            {title.trim() || "My Bucket List"}
          </h3>
          <p className="text-sm font-semibold" style={{ color: accent }}>
            Aking Listahan
          </p>
          <ul className="mt-4 space-y-2">
            {(items.length ? items : ["Add your first item…"]).slice(0, 6).map((it, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[15px] text-ink">
                <span
                  className="h-5 w-5 rounded-md border-2"
                  style={{ borderColor: "rgba(14,23,38,0.18)" }}
                />
                {it}
              </li>
            ))}
            {items.length > 6 && (
              <li className="text-sm text-faint">+ {items.length - 6} more</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}
