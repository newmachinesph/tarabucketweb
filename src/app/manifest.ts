import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Web app manifest. The bucket list is already localStorage-first, so "add to home screen"
 * is a genuinely useful thing for a reader to do with this site — this is what makes the
 * install prompt offer a proper name and icon instead of a screenshot and the URL.
 *
 * `start_url` is the bucket list rather than the homepage: someone who installs this is
 * coming back to their list, not to the front page.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/bucket-list",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: "#0E1726",
    lang: "en-PH",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
