import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/fx";
import { DESTINATIONS, type Destination } from "@/lib/destinations";
import type { IslandGroup } from "@/lib/planner-data";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Every Philippine destination on Tara Bucket, grouped Luzon to Mindanao — field guides with the experiences, best months, and how to get there.",
  alternates: { canonical: "/destinations" },
};

const GROUPS: { group: IslandGroup; tint: string }[] = [
  { group: "Luzon", tint: "#14A3E1" },
  { group: "Visayas", tint: "#FF5A36" },
  { group: "Mindanao", tint: "#22C58B" },
];

function CoverArt({ d, tint, priority }: { d: Destination; tint: string; priority: boolean }) {
  if (d.hero) {
    return (
      <Image
        src={d.hero}
        alt={d.name}
        fill
        // Two-column grid above 768px, single column below.
        sizes="(min-width: 768px) 50vw, 100vw"
        priority={priority}
        className="object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
      />
    );
  }
  // No photo yet — a tinted editorial cover keyed to the island group, never a wrong photo.
  return (
    <div
      className="grid h-full w-full place-items-center p-6 text-center transition-transform duration-[1000ms] ease-out group-hover:scale-105"
      style={{ background: `linear-gradient(150deg, ${tint}26, ${tint}0d 60%, transparent)` }}
    >
      <span className="display text-4xl text-ink/80 sm:text-5xl">{d.name}</span>
    </div>
  );
}

export default function DestinationsPage() {
  const byGroup = GROUPS.map(({ group, tint }) => ({
    group,
    tint,
    items: DESTINATIONS.filter((d) => d.islandGroup === group),
  }));

  return (
    <div className="container-tara py-14">
      <Reveal>
        <header className="mb-14 max-w-3xl border-b border-line pb-8">
          <p className="kicker mb-4 text-orange">The gazetteer</p>
          <h1 className="display text-6xl text-ink sm:text-7xl">
            Places worth the <span className="display-italic text-orange">flight</span>
          </h1>
          <p className="mt-5 text-lg text-muted">
            {`Field guides to ${DESTINATIONS.length} Philippine destinations, Luzon to Mindanao — what to do, when to go, and how to get there. Pick one to build a plan around.`}
          </p>
          <Link
            href="/map"
            className="mt-4 inline-flex text-sm font-semibold text-blue-dark hover:text-orange"
          >
            See them on the map &rarr;
          </Link>
        </header>
      </Reveal>

      <div className="space-y-16">
        {byGroup.map(({ group, tint, items }) => (
          <section key={group}>
            <div className="mb-8 flex items-baseline gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: tint }}
                aria-hidden
              />
              <h2 className="display text-3xl text-ink">{group}</h2>
              <span className="text-sm font-semibold text-faint">
                {items.length} destinations
              </span>
            </div>

            <RevealStagger className="grid gap-x-8 gap-y-14 md:grid-cols-2" gap={0.06}>
              {items.map((d, i) => (
                <RevealItem key={d.slug}>
                  <Link href={`/destinations/${d.slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                      {/* Only the first row of the first group is above the fold. */}
                      <CoverArt d={d} tint={tint} priority={group === "Luzon" && i < 2} />
                    </div>
                    <div className="flex items-start justify-between pt-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                          {d.region}
                        </span>
                        <h3 className="display mt-1.5 text-3xl text-ink">{d.name}</h3>
                        <p className="mt-1 max-w-sm text-muted text-pretty">{d.blurb}</p>
                        <p className="mt-2 text-xs font-semibold text-faint">
                          {d.experiences.length} experiences · {d.suggestedDays} days
                        </p>
                      </div>
                      <ArrowUpRight
                        size={22}
                        className="mt-1 shrink-0 text-ink/30 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealStagger>
          </section>
        ))}
      </div>
    </div>
  );
}
