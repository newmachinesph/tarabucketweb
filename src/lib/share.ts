import { SITE } from "@/lib/site";

/**
 * Share-link attribution.
 *
 * VIRAL.md's measurement spec: every share object gets a ref code stamped in at generation
 * time, per surface and per template variant. Without it there is no way to tell which
 * mechanic actually spread — and the honest answer is usually "only one of them did", which
 * you can only act on if you measured it.
 *
 * One helper, one vocabulary, so a new surface can't invent its own parameter name and
 * quietly fall out of the funnel.
 */

/** Every surface that can mint a link. Adding one here is what makes it countable. */
export const SHARE_SURFACES = [
  "quiz-result",
  "quiz-invite",
  "profile-card",
  "bridge-plan",
  "restore-link",
  "destination",
  "itinerary",
] as const;

export type ShareSurface = (typeof SHARE_SURFACES)[number];

/** The query parameter. Short because half these links get typed into a group chat by hand. */
export const REF_PARAM = "ref";

/**
 * Absolute URL for a share object.
 *
 * Absolute, not relative: these are pasted into Messenger, Viber, and IG bios, where a
 * relative path is just text. Uses the same `SITE.url` every canonical is built from, so a
 * misconfigured deploy fails in one visible place rather than silently minting dead links.
 */
export function shareUrl(path: string, surface: ShareSurface): string {
  const base = SITE.url.replace(/\/+$/, "");
  const url = new URL(path.startsWith("/") ? path : `/${path}`, `${base}/`);
  url.searchParams.set(REF_PARAM, surface);
  return url.toString();
}

/**
 * Group-chat-native share text.
 *
 * Messenger and Viber compress images and bury them in scrollback, but text survives intact
 * and stays searchable — so the primary share object for a GC is a few lines of text with a
 * link, not a card. Kept short: anything longer gets truncated behind a "See more" tap.
 */
export function shareText({ headline, detail }: { headline: string; detail?: string }): string {
  return [headline, detail].filter(Boolean).join("\n");
}

/**
 * Hand off to the OS share sheet, falling back to the clipboard.
 *
 * `navigator.share` is the only path that reaches Messenger and Viber directly from a phone,
 * which is where these links need to land. Desktop and unsupported browsers get a clipboard
 * copy instead. Returns what actually happened so the UI can say so rather than guessing.
 */
export async function shareOrCopy(payload: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (err) {
      // The user dismissing the sheet is a normal outcome, not a failure to report.
      if (err instanceof DOMException && err.name === "AbortError") return "failed";
    }
  }
  try {
    await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
