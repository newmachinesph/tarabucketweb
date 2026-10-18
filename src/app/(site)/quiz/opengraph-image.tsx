import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { CATALOG_SIZE } from "@/lib/progress-constants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "How many Philippine bucket-list icons have you done?";

/**
 * The card that does the recruiting. When someone drops their score into a group chat, this
 * is the unfurl every other person in that chat sees — so it asks the question rather than
 * describing the product.
 */
export default function Image() {
  return renderOgCard({
    kicker: "2-minute quiz",
    title: "How many have you done?",
    subtitle: `Swipe through the Philippine icons and get your number out of ${CATALOG_SIZE.toLocaleString()}. No sign-up.`,
  });
}
