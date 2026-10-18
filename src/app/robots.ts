import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Answer-engine crawlers are listed explicitly rather than left to the `*` rule.
 *
 * `*` already allows them, so this changes no behaviour — it records a decision. This site
 * earns its living by being the cited Philippine bucket-list reference, so being readable
 * by the engines that answer "what should I do in Palawan" is the business model, not a
 * leak of it. Naming them means a future decision to exclude one is a deliberate edit here
 * instead of a silent side effect of tightening the wildcard.
 *
 * Blocked everywhere: `/admin` (auth), `/api` (no crawlable content), `/search` and
 * `/profile` (thin, per-device, or duplicate).
 */
const DISALLOW = ["/admin", "/api", "/search", "/profile"];

const ANSWER_ENGINE_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...ANSWER_ENGINE_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
