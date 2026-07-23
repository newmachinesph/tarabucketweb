import type { CatalogFilters } from "@/lib/catalog";

// Hand-curated filter presets over the catalog. Each collection is just a saved set of
// listCatalog() filters — no new data, no join table. Add a slug here and it gets a page.
export type Collection = {
  slug: string;
  title: string;
  emoji: string;
  blurb: string;
  filters: CatalogFilters;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "free-adventures",
    title: "Free adventures",
    emoji: "🎒",
    blurb: "Big days out that cost nothing but the trip there.",
    filters: { cost: "free", category: "adventure" },
  },
  {
    slug: "weekend-escapes",
    title: "Weekend escapes",
    emoji: "🌤",
    blurb: "Two-day trips worth booking the Friday leave for.",
    filters: { duration: "weekend" },
  },
  {
    slug: "splurge-worthy",
    title: "Splurge-worthy",
    emoji: "💎",
    blurb: "Once-in-a-while experiences worth the spend.",
    filters: { cost: "splurge" },
  },
  {
    slug: "easy-wins",
    title: "Easy wins",
    emoji: "✅",
    blurb: "Low-effort experiences you can tick off in an afternoon.",
    filters: { difficulty: "easy", duration: "hours" },
  },
  {
    slug: "foodie-trail",
    title: "The foodie trail",
    emoji: "🍜",
    blurb: "Dishes and food trips worth the flight.",
    filters: { category: "food" },
  },
  {
    slug: "festival-calendar",
    title: "Festival calendar",
    emoji: "🎉",
    blurb: "Fiestas and events to time a trip around.",
    filters: { category: "festivals" },
  },
];

export function collectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
