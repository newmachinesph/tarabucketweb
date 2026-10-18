import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/fx";
import { ButtonLink } from "@/components/ui";
import { MapLoader } from "@/components/map/map-loader";
import { DestinationDirectory } from "@/components/map/destination-directory";
import { mapPoints } from "@/lib/catalog";

// Coordinates only change when the geocoder runs — cache aggressively.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Map",
  description:
    "Every geocoded experience in the Philippine bucket-list catalog on one map — from Batanes to Tawi-Tawi, with destination guides for each island group.",
  alternates: { canonical: "/map" },
};

export default async function MapPage() {
  const points = await mapPoints();

  return (
    <div className="container-tara py-10 lg:py-14">
      <Reveal>
        <header className="mb-8 max-w-3xl">
          <p className="kicker mb-3 text-orange">The archipelago</p>
          <h1 className="display text-4xl text-ink sm:text-5xl">
            The list, on a <span className="display-italic text-orange">map</span>
          </h1>
          <p className="mt-3 text-muted">
            {points.length} experiences pinned across the islands. Tap a dot to see what it
            is &mdash; then let the planner turn it into actual days.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/plan" variant="primary" size="sm">
              Plan a trip
            </ButtonLink>
            <ButtonLink href="/explore" variant="outline" size="sm">
              All experiences
            </ButtonLink>
          </div>
        </header>
      </Reveal>

      <MapLoader points={points} />

      <section className="mt-16 border-t border-line pt-12">
        <Reveal>
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="kicker mb-3 text-orange">Where to go</p>
              <h2 className="display text-3xl text-ink sm:text-4xl">
                Destination <span className="display-italic text-orange">guides</span>
              </h2>
            </div>
            <Link
              href="/destinations"
              className="text-sm font-semibold text-blue-dark hover:text-orange"
            >
              All destinations &rarr;
            </Link>
          </header>
        </Reveal>
        <DestinationDirectory />
      </section>
    </div>
  );
}
