import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    // Keep search-result pages out of the index; they're thin/duplicate content.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/search"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
