/**
 * The absolute origin every canonical URL, sitemap entry, OG `url`, JSON-LD `@id`, and
 * `llms.txt` link is built from.
 *
 * Getting this wrong doesn't throw — it silently ships a site telling every search and
 * answer engine that it lives on localhost, which is unrecoverable until the next deploy
 * and a re-crawl. `NEXT_PUBLIC_*` is **inlined at build time**, so it has to be set in the
 * deploy environment; setting it afterwards does nothing to an existing build.
 *
 * Read once here rather than at each call site so there's a single place to check it.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const url = configured || "http://localhost:3000";

  // Loud, because the failure mode is silent. A local production build is legitimate, so
  // this warns rather than throws — but it will be sitting in the deploy log if it matters.
  if (process.env.NODE_ENV === "production" && /^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) {
    console.warn(
      "\n[site] NEXT_PUBLIC_SITE_URL is unset or localhost in a production build.\n" +
        "       Canonical URLs, the sitemap, OG tags, and JSON-LD will all point at localhost.\n" +
        "       Set it in the deploy environment — it is inlined at build time.\n",
    );
  }

  return url;
}

export const SITE = {
  name: "Tara Bucket",
  tagline: "The Philippine bucket-list journal",
  description:
    "Stories, guides, and inspiration for your Philippine bucket list - islands, food, festivals, adventure, nature, and culture. Tara na, let's go.",
  url: resolveSiteUrl(),
  // "Destinations" takes the header slot now that the gazetteer index is live — it's the
  // higher-intent browse entry. The map keeps its links from that index, /explore, and the
  // footer, so nothing is orphaned and the header stays at seven items.
  nav: [
    // "How many?" leads: it's the activation surface, and it's the only nav item that poses
    // a question — the one thing that reliably earns a tap from a first-time visitor.
    { label: "How many?", href: "/quiz" },
    { label: "Plan", href: "/plan" },
    { label: "Explore", href: "/explore" },
    { label: "Destinations", href: "/destinations" },
    { label: "Read", href: "/blog" },
    { label: "Bucket Lists", href: "/bucket-list" },
    { label: "About", href: "/about" },
  ],
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/tarabucketph" },
    { label: "Facebook", href: "https://www.facebook.com/tarabucketph" },
    // TikTok handles are @-prefixed in the URL path.
    { label: "TikTok", href: "https://www.tiktok.com/@tarabucketph" },
  ],
} as const;
