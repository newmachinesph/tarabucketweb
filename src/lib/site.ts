export const SITE = {
  name: "Tara Bucket",
  tagline: "The Philippine bucket-list journal",
  description:
    "Stories, guides, and inspiration for your Philippine bucket list - islands, food, festivals, adventure, nature, and culture. Tara na, let's go.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nav: [
    { label: "Read", href: "/blog" },
    { label: "Explore", href: "/explore" },
    { label: "Destinations", href: "/destinations" },
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
