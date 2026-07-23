import Link from "next/link";
import type { ReactNode } from "react";
import { categoryByKey } from "@/lib/categories";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[15px]",
  lg: "px-7 py-3.5 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-orange text-white shadow-[0_8px_24px_-8px_rgba(255,90,54,0.7)] hover:bg-orange-dark hover:-translate-y-0.5",
  secondary:
    "bg-blue text-white shadow-[0_8px_24px_-8px_rgba(20,163,225,0.7)] hover:bg-blue-dark hover:-translate-y-0.5",
  outline: "border-2 border-ink/15 text-ink hover:border-ink/30 hover:bg-surface",
  ghost: "text-ink hover:bg-surface",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: keyof typeof sizes = "md",
): string {
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${buttonClasses(variant, size)} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClasses(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}

export function CategoryPill({
  categoryKey,
  className = "",
  interactive = true,
}: {
  categoryKey: string;
  className?: string;
  interactive?: boolean;
}) {
  const cat = categoryByKey(categoryKey);
  if (!cat) return null;
  const content = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${className}`}
      style={{ backgroundColor: `${cat.color}1A`, color: cat.color }}
    >
      <span aria-hidden>{cat.emoji}</span>
      {cat.label}
    </span>
  );
  if (!interactive) return content;
  return (
    <Link href={`/category/${cat.key}`} className="transition-transform hover:scale-105">
      {content}
    </Link>
  );
}

/** Small neutral pill for item metadata (cost band, duration, difficulty). */
export function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-orange">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
