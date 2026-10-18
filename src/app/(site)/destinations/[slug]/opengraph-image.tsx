import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { destinationBySlug, DESTINATIONS, destinationFacts } from "@/lib/destinations";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Destination guide";

/** Island-group tints, matching the page itself so the card and the landing agree. */
const GROUP_TINT = { Luzon: "#14A3E1", Visayas: "#FF5A36", Mindanao: "#22C58B" } as const;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = destinationBySlug(slug);

  // The route itself 404s for an unknown slug; the card just falls back rather than throwing
  // during a crawl.
  if (!d) {
    return renderOgCard({ kicker: "Destinations", title: "The Philippine bucket list" });
  }

  const facts = destinationFacts(d);
  return renderOgCard({
    kicker: d.region,
    title: d.name,
    subtitle: `${facts.experienceCount} things to do · ${d.suggestedDays} days · ${facts.costRange}`,
    accent: GROUP_TINT[d.islandGroup],
  });
}
