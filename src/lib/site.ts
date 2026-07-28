export const SITE = {
  name: "Tara Bucket",
  tagline: "The Philippine bucket-list journal",
  description:
    "Stories, guides, and inspiration for your Philippine bucket list - islands, food, festivals, adventure, nature, and culture. Tara na, let's go.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // "Map" stands in for the old "Destinations" entry — it links through to every
  // destination guide, so nothing is orphaned and the header doesn't grow to eight items.
  nav: [
    { label: "Plan", href: "/plan" },
    { label: "Explore", href: "/explore" },
    { label: "Map", href: "/map" },
    { label: "Read", href: "/blog" },
    { label: "Bucket Lists", href: "/bucket-list" },
    { label: "Stories", href: "/stories" },
    { label: "About", href: "/about" },
  ],
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/tarabucketph" },
    { label: "Facebook", href: "https://www.facebook.com/tarabucketph" },
    // TikTok handles are @-prefixed in the URL path.
    { label: "TikTok", href: "https://www.tiktok.com/@tarabucketph" },
  ],
} as const;
