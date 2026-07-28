import Link from "next/link";
import { DESTINATIONS } from "@/lib/destinations";
import { DESTINATIONS_PLAN, type PlannerDestination } from "@/lib/planner-data";

/**
 * Schematic map of the destinations we cover.
 *
 * Pin positions are the destinations' real coordinates on a plain equirectangular
 * projection — accurate relative to each other — but there is no coastline, because
 * shipping a real basemap means either a tile provider (a network dependency and an API
 * key on a static page) or a large embedded outline. Phase 3 of PLAN.md adds lat/lng to
 * `catalogItems` and a proper basemap; this is the honest version until then.
 *
 * The SVG is decorative for assistive tech — the destination list underneath carries the
 * same information in a form that can actually be read and tabbed through.
 */

// Bounding box of the archipelago, with a little margin.
const WEST = 116;
const EAST = 127;
const NORTH = 21.5;
const SOUTH = 4.5;
const SCALE = 50;

const WIDTH = (EAST - WEST) * SCALE;
const HEIGHT = (NORTH - SOUTH) * SCALE;

const projectX = (lng: number) => (lng - WEST) * SCALE;
const projectY = (lat: number) => (NORTH - lat) * SCALE;

/** Destination guides that exist as their own page; the rest fall back to a search. */
const GUIDE_SLUGS = new Set(DESTINATIONS.map((d) => d.slug));

function hrefFor(d: PlannerDestination): string {
  return GUIDE_SLUGS.has(d.slug)
    ? `/destinations/${d.slug}`
    : `/explore?q=${encodeURIComponent(d.name)}`;
}

const GROUP_COLOR = {
  Luzon: "#14A3E1",
  Visayas: "#FF5A36",
  Mindanao: "#22C58B",
} as const;

export function PhMap() {
  return (
    <figure className="rounded-3xl border border-line bg-surface/60 p-4 sm:p-6">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mx-auto block h-auto w-full max-w-xl"
        aria-hidden
        focusable="false"
      >
        {/* One-degree graticule, for a sense of scale. */}
        <g stroke="rgba(14,23,38,0.07)" strokeWidth={1}>
          {Array.from({ length: EAST - WEST + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * SCALE} y1={0} x2={i * SCALE} y2={HEIGHT} />
          ))}
          {Array.from({ length: NORTH - SOUTH + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * SCALE} x2={WIDTH} y2={i * SCALE} />
          ))}
        </g>

        {DESTINATIONS_PLAN.map((d) => {
          const x = projectX(d.lng);
          const y = projectY(d.lat);
          // Flip the label to the inside edge near the right margin so it stays on canvas.
          const labelRight = x < WIDTH * 0.62;
          const color = GROUP_COLOR[d.islandGroup];
          return (
            <g key={d.slug}>
              <circle cx={x} cy={y} r={14} fill={color} opacity={0.16} />
              <circle cx={x} cy={y} r={5} fill={color} />
              <text
                x={labelRight ? x + 12 : x - 12}
                y={y + 4}
                textAnchor={labelRight ? "start" : "end"}
                fontSize={15}
                fontWeight={600}
                fill="#0E1726"
              >
                {d.name}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-faint">
        {(["Luzon", "Visayas", "Mindanao"] as const).map((g) => (
          <span key={g} className="inline-flex items-center gap-1.5 font-semibold">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: GROUP_COLOR[g] }}
              aria-hidden
            />
            {g}
          </span>
        ))}
        <span>Pins sit at real coordinates; coastlines aren&rsquo;t drawn.</span>
      </figcaption>
    </figure>
  );
}

/** The readable, linkable version of the map. */
export function DestinationDirectory() {
  const groups = (["Luzon", "Visayas", "Mindanao"] as const).map((group) => ({
    group,
    destinations: DESTINATIONS_PLAN.filter((d) => d.islandGroup === group),
  }));

  return (
    <div className="space-y-10">
      {groups.map(({ group, destinations }) => (
        <section key={group}>
          <h2 className="mb-4 flex items-center gap-2.5 text-xl font-extrabold text-ink">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: GROUP_COLOR[group] }}
              aria-hidden
            />
            {group}
            <span className="text-sm font-semibold text-faint">
              {destinations.length} destinations
            </span>
          </h2>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link
                  href={hrefFor(d)}
                  className="group flex h-full flex-col rounded-3xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <h3 className="display text-xl leading-snug text-ink group-hover:text-orange">
                    {d.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted">{d.region}</p>
                  <p className="mt-3 text-sm text-muted text-pretty">{d.blurb}</p>
                  <p className="mt-auto pt-4 text-xs text-faint">
                    {d.experiences.length} experiences &middot; {d.suggestedDays} days
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
