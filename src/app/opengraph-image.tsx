import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { SITE } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${SITE.name} — ${SITE.tagline}`;

/** Default card, inherited by every page that doesn't generate its own. */
export default function Image() {
  return renderOgCard({
    kicker: "Tara na, let's go",
    title: "The Philippine bucket-list journal",
    subtitle: "Islands, food, festivals, adventure — and a planner that turns them into days.",
  });
}
