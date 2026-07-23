import Link from "next/link";
import { RevealStagger, RevealItem } from "@/components/fx";
import { CategoryPill, MetaPill } from "@/components/ui";
import type { CatalogItem } from "@/db/schema";

function formatLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** One experience card. Shared by /explore, /explore/region, /collections, and /tag. */
export function CatalogCard({ item }: { item: CatalogItem }) {
  const location = [item.place, item.province, item.region].filter(Boolean).join(", ");
  return (
    <Link
      href={`/experience/${item.id}`}
      className="group flex h-full flex-col rounded-3xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <CategoryPill categoryKey={item.categoryKey} interactive={false} />
      <h2 className="display mt-3 text-xl leading-snug text-ink group-hover:text-orange">
        {item.title}
      </h2>
      {location && <p className="mt-1 text-sm text-muted">{location}</p>}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {item.costBand && <MetaPill>{formatLabel(item.costBand)}</MetaPill>}
        {item.duration && <MetaPill>{formatLabel(item.duration)}</MetaPill>}
        {item.difficulty && <MetaPill>{formatLabel(item.difficulty)}</MetaPill>}
      </div>
      {item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-2 text-xs text-faint">
          {item.tags.slice(0, 3).map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

/** Animated grid of experience cards. */
export function CatalogGrid({ items }: { items: CatalogItem[] }) {
  return (
    <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.05}>
      {items.map((item) => (
        <RevealItem key={item.id}>
          <CatalogCard item={item} />
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
