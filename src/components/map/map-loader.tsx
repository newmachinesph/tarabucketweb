"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/catalog";

// Leaflet touches `window` at import time, so it can only load in the browser.
// `ssr: false` requires a Client Component parent — that's this file's whole job.
const CatalogMap = dynamic(() => import("./catalog-map").then((m) => m.CatalogMap), {
  ssr: false,
  loading: () => (
    <div className="grid h-[70vh] w-full place-items-center rounded-3xl border border-line bg-surface">
      <p className="text-sm font-semibold text-faint">Loading the map…</p>
    </div>
  ),
});

export function MapLoader({ points }: { points: MapPoint[] }) {
  return <CatalogMap points={points} />;
}
