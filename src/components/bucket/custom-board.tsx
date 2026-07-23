"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BucketBoard, type BucketList } from "./bucket-board";
import { useMounted, useStoredRaw } from "@/lib/local-store";

export function CustomBoard({ slug }: { slug: string }) {
  const mounted = useMounted();
  const raw = useStoredRaw("tb:custom");
  const list = useMemo(() => {
    try {
      const arr: BucketList[] = raw ? JSON.parse(raw) : [];
      return arr.find((l) => l.id === slug) ?? null;
    } catch {
      return null;
    }
  }, [raw, slug]);

  if (!mounted) return <p className="py-16 text-center text-muted">Loading…</p>;
  if (!list) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold text-ink">
          That list isn&apos;t on this device.
        </p>
        <p className="mt-1 text-muted">
          Custom lists are saved locally. Make a new one?
        </p>
        <Link
          href="/bucket-list"
          className="mt-5 inline-block rounded-full bg-orange px-6 py-3 font-semibold text-white hover:bg-orange-dark"
        >
          Back to bucket lists
        </Link>
      </div>
    );
  }
  return <BucketBoard list={list} />;
}
