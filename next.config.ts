import type { NextConfig } from "next";
import { OPTIMIZABLE_IMAGE_HOSTS } from "./src/lib/image-hosts";

// Baseline security headers applied to every response. A strict CSP is intentionally
// omitted here (Next injects inline runtime script/style); add one via a nonce-based
// setup if/when the app can support it.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Derived from the same list `components/cover-image.tsx` checks at render time, so the
    // config and the runtime guard can't drift into a request-time crash.
    remotePatterns: OPTIMIZABLE_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
