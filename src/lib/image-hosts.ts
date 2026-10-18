/**
 * Hosts `next/image` is allowed to optimize.
 *
 * Single source of truth: `next.config.ts` builds its `images.remotePatterns` from this
 * list, and `components/cover-image.tsx` decides at render time whether a given URL can go
 * through the optimizer. Kept in one place because the two drifting apart is a runtime
 * crash — `next/image` throws on an un-allowlisted host, and only on the request that
 * happens to use one.
 *
 * Imported by `next.config.ts`, so: no `@/` alias, no React, no server-only imports.
 */
export const OPTIMIZABLE_IMAGE_HOSTS = ["images.unsplash.com"] as const;

/**
 * Can this URL go through `next/image`? Editors paste arbitrary cover URLs, so this is
 * asked per-image rather than assumed per-page.
 */
export function isOptimizableImage(src: string): boolean {
  try {
    return (OPTIMIZABLE_IMAGE_HOSTS as readonly string[]).includes(new URL(src).hostname);
  } catch {
    // Relative path or malformed URL — not something the optimizer can fetch.
    return false;
  }
}
