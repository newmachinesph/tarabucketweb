"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Trash2, ArrowUpRight } from "lucide-react";
import type { BucketList } from "./bucket-board";
import { removeStore, useStoredRaw, writeStore } from "@/lib/local-store";

export function MyLists() {
  const raw = useStoredRaw("tb:custom");
  const lists = useMemo<BucketList[]>(() => {
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [raw]);

  function remove(id: string) {
    writeStore("tb:custom", JSON.stringify(lists.filter((l) => l.id !== id)));
    removeStore(`tb:checks:${id}`);
  }

  if (lists.length === 0) return null;

  return (
    <section className="container-tara pb-4">
      <h2 className="mb-6 text-2xl font-extrabold text-ink">Your lists</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((l) => (
          <div
            key={l.id}
            className="group relative flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5"
          >
            <Link href={`/bucket-list/${l.id}`} className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-xl"
                style={{ background: `${l.accent}1A` }}
              >
                {l.emoji}
              </span>
              <div>
                <p className="font-bold text-ink group-hover:text-blue-dark">{l.title}</p>
                <p className="text-sm text-faint">{l.items.length} items</p>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => remove(l.id)}
                aria-label="Delete list"
                className="rounded-full p-2 text-faint transition-colors hover:bg-red/10 hover:text-red"
              >
                <Trash2 size={16} />
              </button>
              <Link
                href={`/bucket-list/${l.id}`}
                className="rounded-full p-2 text-ink/40 transition-colors hover:text-ink"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
