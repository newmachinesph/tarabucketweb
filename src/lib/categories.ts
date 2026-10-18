// Shared category taxonomy - brand colours from the mobile app tokens.
export type CategoryKey =
  | 'travel'
  | 'food'
  | 'festivals'
  | 'adventure'
  | 'nature'
  | 'culture';

export type Category = {
  key: CategoryKey;
  label: string;
  tagalog: string;
  emoji: string;
  color: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  { key: 'travel', label: 'Travel', tagalog: 'Lakwatsa', emoji: '🏝', color: '#14A3E1',
    blurb: 'Islands, road trips, and hidden corners of the 7,641.' },
  { key: 'food', label: 'Food', tagalog: 'Pagkain', emoji: '🍜', color: '#FF5A36',
    blurb: 'Kakanin, carinderia gems, and dishes worth the flight.' },
  { key: 'festivals', label: 'Festivals', tagalog: 'Pista', emoji: '🎉', color: '#FF4D67',
    blurb: 'Ati-Atihan to Sinulog - the calendar of color.' },
  { key: 'adventure', label: 'Adventure', tagalog: 'Pakikipagsapalaran', emoji: '🧗', color: '#22C58B',
    blurb: 'Summit, surf, dive, and freefall your way through the list.' },
  { key: 'nature', label: 'Nature', tagalog: 'Kalikasan', emoji: '🌱', color: '#0EA5A5',
    blurb: 'Waterfalls, rice terraces, and reefs to protect.' },
  { key: 'culture', label: 'Culture & Heritage', tagalog: 'Kultura', emoji: '🎭', color: '#7C4DFF',
    blurb: 'Old towns, crafts, and the stories behind them.' },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export function categoryByKey(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

export function categoryLabel(key: string): string {
  return categoryByKey(key)?.label ?? key;
}

export function categoryColor(key: string): string {
  return categoryByKey(key)?.color ?? '#0E1726';
}
