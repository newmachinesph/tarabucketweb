import Image from "next/image";
import { isOptimizableImage } from "@/lib/image-hosts";

/**
 * A cover photo that gets optimized when it can be, and still renders when it can't.
 *
 * Post covers are editor-supplied arbitrary URLs. `next/image` throws at request time on a
 * host that isn't in `remotePatterns`, which is why AUDIT.md's M6 deferred the migration
 * wholesale — but that was an all-or-nothing framing. Per-image, the common case (our
 * allowlisted CDN) gets AVIF/WebP, a responsive `srcset`, and no layout shift, and anything
 * else falls back to a plain `<img>` instead of crashing the page. No editorial policy
 * needed, and adding a host to `lib/image-hosts.ts` upgrades every cover on it at once.
 *
 * Always fills its parent, so the parent must be `relative` with a reserved size
 * (an aspect-ratio box or a fixed height).
 */
export function CoverImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  /** Empty string only when the image is decorative and adjacent text carries the meaning. */
  alt: string;
  /** Rendered width at each breakpoint, so the optimizer picks a sane source. */
  sizes: string;
  /** Set on the LCP image only — emits a preload and disables lazy loading. */
  priority?: boolean;
  className?: string;
}) {
  if (isOptimizableImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
