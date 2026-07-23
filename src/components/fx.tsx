"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Entrance reveal. Animates on mount (not scroll-gated) so content is NEVER
 * left stuck invisible if an IntersectionObserver fails to fire.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered group — children are <RevealItem>. Mount-based, reliable. */
export function RevealStagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : gap } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? {} : { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Kinetic headline: words mask-reveal upward on mount. Keeps a11y text intact. */
export function KineticWords({
  text,
  className,
  delay = 0.1,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden
          style={{ paddingBottom: "0.08em", marginRight: "0.26em" }}
        >
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: delay + i * 0.06, ease: EASE }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Magnetic pill link — cursor pulls the button. Static under reduced motion. */
export function MagneticLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 160, damping: 15, mass: 0.3 });

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  }
  function resetPos() {
    x.set(0);
    y.set(0);
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={resetPos}
      className="inline-block"
    >
      <motion.span
        style={{ x: sx, y: sy }}
        whileTap={{ scale: 0.96 }}
        className={className}
      >
        {children}
      </motion.span>
    </Link>
  );
}

/** Seamless CSS marquee (one per page). Duplicated content for a clean loop. */
export function Marquee({
  items,
  className = "",
}: {
  items: ReactNode[];
  className?: string;
}) {
  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div className="marquee-track">
        {[...items, ...items].map((it, i) => (
          <span key={i} className="mx-8 inline-flex items-center">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
