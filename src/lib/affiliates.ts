/**
 * Affiliate partner registry and link builder.
 *
 * Tara Bucket is not a travel agency: we never hold inventory, take payment, or carry
 * cancellation liability. Every transaction happens on a partner's site. This module is
 * the whole monetization surface — a static registry plus a deterministic
 * experience-to-partner mapping.
 *
 * Deliberately not `server-only`: the trip planner renders partner links client-side.
 * Pure functions, no network, no secrets.
 */

export type PartnerKind = "tours" | "stays" | "transport";

export type Partner = {
  key: string;
  name: string;
  kind: PartnerKind;
  /** Why a reader would pick this partner over the others. Shown in the UI verbatim —
   *  the reader gets to choose, so this stays honest rather than promotional. */
  strength: string;
  /** Builds a search deep-link. `query` arrives already trimmed, not yet encoded. */
  url: (query: string) => string;
};

/**
 * Placeholder attribution IDs. Each affiliate program issues its own once approved, and
 * each uses a different parameter name — hence the per-partner `url` builders rather
 * than one generic appender.
 *
 * ponytail: these are search-URL shapes, not contractual deep-link formats. Confirm each
 * against the program's own docs at integration time; some programs require a redirect
 * domain rather than a query param, which is why partners own their URL builder.
 */
const AFFILIATE_ID = process.env.NEXT_PUBLIC_AFFILIATE_ID ?? "tarabucket-pending";

const enc = encodeURIComponent;

export const PARTNERS: Partner[] = [
  {
    key: "klook",
    name: "Klook",
    kind: "tours",
    strength: "Widest tour and activity coverage in the Philippines.",
    url: (q) => `https://www.klook.com/en-PH/search/?query=${enc(q)}&aid=${enc(AFFILIATE_ID)}`,
  },
  {
    key: "guidetotheph",
    name: "Guide to the Philippines",
    kind: "tours",
    strength: "Local operators and packages, often cheaper than the global sites.",
    url: (q) => `https://guidetothephilippines.ph/search?q=${enc(q)}&ref=${enc(AFFILIATE_ID)}`,
  },
  {
    key: "getyourguide",
    name: "GetYourGuide",
    kind: "tours",
    strength: "Free cancellation on most tours, up to 24 hours before.",
    url: (q) => `https://www.getyourguide.com/s/?q=${enc(q)}&partner_id=${enc(AFFILIATE_ID)}`,
  },
  {
    key: "agoda",
    name: "Agoda",
    kind: "stays",
    strength: "Strongest inventory for Philippine hotels and homestays.",
    url: (q) => `https://www.agoda.com/search?city=${enc(q)}&cid=${enc(AFFILIATE_ID)}`,
  },
  {
    key: "booking",
    name: "Booking.com",
    kind: "stays",
    strength: "Reliable free-cancellation filters and review volume.",
    url: (q) => `https://www.booking.com/searchresults.html?ss=${enc(q)}&aid=${enc(AFFILIATE_ID)}`,
  },
  {
    key: "12go",
    name: "12Go",
    kind: "transport",
    strength: "Ferries, buses, and vans between islands — the routes airlines skip.",
    url: (q) => `https://12go.asia/en/travel/${enc(q.toLowerCase().replace(/\s+/g, "-"))}`,
  },
];

export function partnerByKey(key: string): Partner | undefined {
  return PARTNERS.find((p) => p.key === key);
}

/** Shown on every monetized surface. One sentence, plain language, no euphemism. */
export const AFFILIATE_DISCLOSURE =
  "Some links are affiliate links — if you book through them we may earn a small commission at no extra cost to you. It never changes what we recommend.";

/** Attributes required on every outbound partner link. `sponsored` keeps us compliant
 *  with search-engine link guidelines, which protects the organic traffic the whole
 *  business runs on. */
export const PARTNER_LINK_REL = "sponsored noopener noreferrer";

export type AffiliateContext = {
  /** The experience being monetized — used for labelling, not for the partner query. */
  title: string;
  place?: string | null;
  province?: string | null;
  region?: string | null;
  duration?: string | null;
  /** Where the click came from, for attribution once real subids are wired. */
  source?: string;
};

export type AffiliateLink = {
  partner: Partner;
  href: string;
  /** What the reader is actually about to search for on the partner's site. */
  label: string;
};

/**
 * Partner catalogs are indexed by place, not by bucket-list phrasing — searching Klook
 * for "Hop the islands of El Nido's Bacuit Bay" returns nothing, while "El Nido" returns
 * the tour that experience describes. So the query is always the most specific *location*
 * we know, and the experience title is used only for the human-readable label.
 */
function locationQuery(ctx: AffiliateContext): string {
  return ctx.place || ctx.province || ctx.region || "Philippines";
}

/** Multi-day experiences imply a stay; a two-hour one doesn't. */
const STAY_DURATIONS = new Set(["day", "weekend", "multi-day"]);

/**
 * Ranked partner links for one experience. Capped at four: past that it reads as a link
 * farm and the click-through on every individual link drops.
 */
export function affiliateLinksFor(ctx: AffiliateContext): AffiliateLink[] {
  const query = locationQuery(ctx);
  const links: AffiliateLink[] = [];

  for (const partner of PARTNERS) {
    if (partner.kind === "stays" && !STAY_DURATIONS.has(ctx.duration ?? "")) continue;
    // Transport only makes sense once we know a real destination to route to.
    if (partner.kind === "transport" && query === "Philippines") continue;

    links.push({
      partner,
      href: partner.url(query),
      label:
        partner.kind === "stays"
          ? `Stays in ${query}`
          : partner.kind === "transport"
            ? `Getting to ${query}`
            : `Tours in ${query}`,
    });
  }

  // Tours first — that's what a bucket-list reader is actually shopping for.
  const order: Record<PartnerKind, number> = { tours: 0, stays: 1, transport: 2 };
  return links.sort((a, b) => order[a.partner.kind] - order[b.partner.kind]).slice(0, 4);
}

/** One booking link per itinerary destination, used by the trip planner's hand-off block. */
export function affiliateLinksForDestination(name: string): AffiliateLink[] {
  return affiliateLinksFor({ title: name, place: name, duration: "multi-day" });
}
