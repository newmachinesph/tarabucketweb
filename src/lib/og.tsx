import { ImageResponse } from "next/og";

/**
 * Shared renderer for the social cards.
 *
 * Every OG image on the site is generated here rather than shipped as a static asset, so a
 * post retitled in the CMS gets a correct card without anyone opening a design tool. The
 * previous setup pointed every page at the logo PNG, which social platforms letterbox or
 * crop — a 1200×630 card is the only size that survives Facebook, X, LinkedIn, iMessage,
 * Slack, and Discord previews intact.
 *
 * Deliberately no custom font fetch: loading Playfair over the network on every card render
 * is a failure mode (and a cold-start cost) for a decorative gain. The system stack renders
 * fine at this size.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const INK = "#0E1726";
const ORANGE = "#FF5A36";
const CREAM = "#FDFBF7";

export function renderOgCard({
  kicker,
  title,
  subtitle,
  accent = ORANGE,
}: {
  /** Small uppercase label — section or region. */
  kicker: string;
  title: string;
  subtitle?: string;
  accent?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          padding: 72,
          // A wide accent bar reads as brand even in the tiny Slack unfurl.
          borderBottom: `24px solid ${accent}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: accent,
              fontWeight: 700,
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: title.length > 48 ? 72 : 92,
              lineHeight: 1.05,
              color: INK,
              fontWeight: 800,
              // Long CMS titles must not push the footer off the canvas.
              maxHeight: 340,
              overflow: "hidden",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 32,
                lineHeight: 1.35,
                color: "#5A6675",
                maxHeight: 90,
                overflow: "hidden",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              borderRadius: 12,
              background: INK,
            }}
          />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: INK }}>
            Tara Bucket
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#8A94A2" }}>
            The Philippine bucket-list journal
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
