import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/fx";
import { PlannerClient } from "@/components/plan/planner-client";
import { DESTINATIONS_PLAN, plannerDestinationBySlug } from "@/lib/planner-data";

export const metadata: Metadata = {
  title: "Trip planner",
  description:
    "Build a day-by-day Philippine itinerary from a curated set of real experiences — pick where, how long, and what you're into, and get a plan you can save as a bucket list.",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const { destination } = await searchParams;
  // Only seed the planner from a slug we actually cover.
  const initialSlug = destination && plannerDestinationBySlug(destination)
    ? destination
    : undefined;

  const experienceCount = DESTINATIONS_PLAN.reduce(
    (n, d) => n + d.experiences.length,
    0,
  );

  return (
    <div className="container-tara py-10 lg:py-14">
      <Reveal>
        <header className="mb-8 max-w-3xl">
          <p className="kicker mb-3 text-orange">Plan a trip</p>
          <h1 className="display text-4xl text-ink sm:text-5xl">
            Your trip, <span className="display-italic text-orange">day by day</span>
          </h1>
          <p className="mt-3 text-muted text-pretty">
            Tell it where you&rsquo;re going, how long you have, and what you&rsquo;re into.
            It builds a day-by-day plan you can adjust, save as a bucket list, and book
            through our partners.
          </p>
          <p className="mt-4 text-sm text-muted">
            {`Every suggestion comes from our own hand-checked set of ${experienceCount} experiences across ${DESTINATIONS_PLAN.length} destinations — so nothing here is an invented beach or a restaurant that closed in 2019. `}
            <Link href="/explore" className="font-semibold text-orange hover:underline">
              Browse the full catalog
            </Link>
            .
          </p>
        </header>
      </Reveal>

      <PlannerClient initialSlug={initialSlug} />
    </div>
  );
}
