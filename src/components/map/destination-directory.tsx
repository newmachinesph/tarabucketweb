import Link from "next/link";
import { DESTINATIONS } from "@/lib/destinations";
import type { IslandGroup } from "@/lib/planner-data";

/**
 * Cross-link from the catalog map to the destination guides.
 *
 * Deliberately a name list, not a second card grid: `/destinations` is the gazetteer and
 * owns that presentation. This is the P4 "one source, one directory" cleanup from
 * DESTINATIONS.md — the list comes from `lib/destinations.ts` like everything else, so a
 * destination added to `planner-data.ts` shows up here with no edit.
 */

const GROUP_COLOR: Record<IslandGroup, string> = {
  Luzon: "#14A3E1",
  Visayas: "#FF5A36",
  Mindanao: "#22C58B",
};

export function DestinationDirectory() {
  const groups = (["Luzon", "Visayas", "Mindanao"] as const).map((group) => ({
    group,
    destinations: DESTINATIONS.filter((d) => d.islandGroup === group),
  }));

  return (
    <div className="space-y-8">
      {groups.map(({ group, destinations }) => (
        <section key={group}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-ink">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: GROUP_COLOR[group] }}
              aria-hidden
            />
            {group}
            <span className="font-semibold tracking-normal text-faint normal-case">
              {destinations.length} guides
            </span>
          </h3>
          <ul className="flex flex-wrap gap-2">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/destinations/${d.slug}`}
                  className="inline-flex items-baseline gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:text-orange"
                >
                  {d.name}
                  <span className="text-xs font-medium text-faint">
                    {d.experiences.length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
