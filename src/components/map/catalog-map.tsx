"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORIES, categoryColor, categoryLabel } from "@/lib/categories";
import type { MapPoint } from "@/lib/catalog";

// Center of the archipelago; zoom 6 frames Batanes to Tawi-Tawi.
const PH_CENTER: [number, number] = [12.6, 121.8];

export function CatalogMap({ points }: { points: MapPoint[] }) {
  // Empty set = show everything; toggling a chip narrows to the chosen categories.
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());

  const visible = useMemo(
    () => (activeCats.size === 0 ? points : points.filter((p) => activeCats.has(p.categoryKey))),
    [points, activeCats],
  );

  function toggle(key: string) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter map by category">
        {CATEGORIES.map((c) => {
          const active = activeCats.size === 0 || activeCats.has(c.key);
          return (
            <button
              key={c.key}
              onClick={() => toggle(c.key)}
              aria-pressed={activeCats.has(c.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-all ${
                activeCats.has(c.key)
                  ? "border-transparent text-white"
                  : "border-line bg-white text-ink hover:border-ink/30"
              } ${active ? "" : "opacity-45"}`}
              style={activeCats.has(c.key) ? { background: c.color } : undefined}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: c.color }}
                aria-hidden
              />
              {c.label}
            </button>
          );
        })}
        {activeCats.size > 0 && (
          <button
            onClick={() => setActiveCats(new Set())}
            className="text-[13px] font-semibold text-muted hover:text-orange"
          >
            Show all
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-line">
        <MapContainer
          center={PH_CENTER}
          zoom={6}
          minZoom={5}
          preferCanvas
          scrollWheelZoom
          className="h-[70vh] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visible.map((p) => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={6}
              weight={1.5}
              color="#ffffff"
              fillColor={categoryColor(p.categoryKey)}
              fillOpacity={0.85}
            >
              <Popup>
                <div className="min-w-44">
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: categoryColor(p.categoryKey) }}>
                    {categoryLabel(p.categoryKey)}
                  </p>
                  <Link href={`/experience/${p.id}`} className="font-semibold underline-offset-2 hover:underline">
                    {p.title}
                  </Link>
                  {(p.place || p.region) && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[p.place, p.region].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <p className="mt-3 text-xs text-faint">
        Showing {visible.length} of {points.length} mapped experiences · Map data ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-ink"
        >
          OpenStreetMap
        </a>{" "}
        contributors
      </p>
    </div>
  );
}
