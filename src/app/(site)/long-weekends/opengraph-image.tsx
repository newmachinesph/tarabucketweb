import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { HOLIDAYS_2027, findBridges } from "@/lib/holidays";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Every 2027 Philippine long weekend";

/**
 * Card for the long-weekend tool. The subtitle carries the actual count computed from the
 * same calendar the page renders, so the unfurl can't drift from the tool — and a concrete
 * number is what makes this worth tapping in an office group chat.
 */
export default function Image() {
  const bridges = findBridges(HOLIDAYS_2027, 2, 2027);
  const daysOff = bridges.reduce((sum, b) => sum + b.length, 0);

  return renderOgCard({
    kicker: "2027 holiday bridges",
    title: "File one day, get four",
    subtitle: `${bridges.length} long weekends — ${daysOff} days off for 2 days of filed leave.`,
    accent: "#14A3E1",
  });
}
