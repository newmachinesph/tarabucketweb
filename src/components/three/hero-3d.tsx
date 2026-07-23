"use client";

import dynamic from "next/dynamic";

// WebGL is client-only and lazy - the page paints instantly, 3D hydrates after.
const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => null,
});

export function Hero3D({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <HeroScene />
    </div>
  );
}
