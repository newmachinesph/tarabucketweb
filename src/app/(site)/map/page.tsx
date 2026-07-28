import type { Metadata } from "next";
import { Reveal } from "@/components/fx";
import { ButtonLink } from "@/components/ui";
import { DestinationDirectory, PhMap } from "@/components/map/ph-map";
import { DESTINATIONS_PLAN } from "@/lib/planner-data";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Every destination we cover, plotted across Luzon, the Visayas, and Mindanao — with what to do in each and how long to give it.",
  alternates: { canonical: "/map" },
};

export default function MapPage() {
  return (
    <div className="container-tara py-14">
      <Reveal>
        <header className="mb-10 max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">Where to go</p>
          <h1 className="display text-6xl text-ink sm:text-7xl">
            The whole <span className="display-italic text-orange">archipelago</span>
          </h1>
          <p className="mt-5 text-lg text-muted text-pretty">
            {DESTINATIONS_PLAN.length} destinations across the three island groups. Start
            anywhere &mdash; then let the planner turn it into actual days.
          </p>
        </header>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <PhMap />
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/plan" variant="primary" size="sm">
              Plan a trip
            </ButtonLink>
            <ButtonLink href="/explore" variant="outline" size="sm">
              All experiences
            </ButtonLink>
          </div>
        </div>

        <DestinationDirectory />
      </div>
    </div>
  );
}
