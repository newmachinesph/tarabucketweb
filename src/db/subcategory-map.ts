// Canonical subcategory names. The source dataset grew organically and carries
// near-duplicate labels ("Cultural Festival" / "Cultural Festivals", "Watersports" /
// "Water Sports", four flavors of "Hiking..."). This map merges them so the /explore
// subcategory facet stays scannable. Applied at seed time (seed-catalog.ts), so the
// database only ever holds canonical values and a re-seed can't reintroduce dupes.
//
// Keyed per site category (categoryKey) because the facet is per-category — the same
// label in two categories never collides in the UI. Values absent from a map pass
// through unchanged.

const MERGES: Record<string, Record<string, string>> = {
  adventure: {
    Hiking: "Hiking & Trekking",
    Watersports: "Water Sports",
    Diving: "Diving & Freediving",
    "Running & Endurance": "Running",
    "Trail Running": "Running",
    Climbing: "Climbing & Caving",
    Caving: "Climbing & Caving",
    "Peak Bagging": "Mountaineering",
  },
  culture: {
    "Churches & Religious Sites": "Churches & Sacred Sites",
    "Heritage Churches": "Churches & Sacred Sites",
    Pilgrimage: "Pilgrimage & Shrines",
    Pilgrimages: "Pilgrimage & Shrines",
    Museums: "Museums & Art",
    "Heritage Crafts": "Traditional Crafts & Weaving",
    "Traditional Crafts": "Traditional Crafts & Weaving",
    "Crafts & Traditional Arts": "Traditional Crafts & Weaving",
    "Arts & Crafts": "Traditional Crafts & Weaving",
    "Forts & Historic Sites": "Historical Sites",
    "Historical Shrines": "Historical Sites",
    "Ancient & Archaeological Sites": "Historical Sites",
    "War History Site": "Historical Sites",
    Monuments: "Historical Sites",
    "Monuments & Memorials": "Historical Sites",
    "Hot Springs & Natural Baths": "Hot Springs & Baths",
    "Bathhouses & Saunas": "Hot Springs & Baths",
    "Transport & Rides": "Transport & Streets",
    Transport: "Transport & Streets",
    "Local Transport": "Transport & Streets",
    "Everyday Life": "Everyday Culture",
    "Religious Tradition": "Faith & Traditions",
    "Temples & Shrines": "Interfaith & Temples",
  },
  festivals: {
    "Cultural Festival": "Cultural Festivals",
    "Religious Festival": "Religious Festivals",
    "Harvest Festival": "Harvest Festivals",
    "Food Festival": "Food Festivals",
    "Music Festival": "Music Festivals",
    "Seasonal Festivals": "Seasonal Events",
  },
  food: {
    "Regional Cuisine": "Regional Specialties",
    "Sweets & Desserts": "Desserts & Kakanin",
    "Kakanin & Delicacies": "Desserts & Kakanin",
    "Local Delicacies": "Delicacies & Pasalubong",
    "Local Delicacy": "Delicacies & Pasalubong",
    "Food Trails": "Food Crawl",
    "Festive Food": "Feasts & Dining",
  },
  nature: {
    "Bird Watching": "Birdwatching",
    Lake: "Lakes",
    "Rivers & Waterfalls": "Waterfalls",
    "Marine Life": "Marine Wildlife",
    "Island Wildlife": "Wildlife Encounters",
    "Mountains & Forests": "Mountains & Highlands",
  },
  travel: {
    "Beaches & Islands": "Islands & Beaches",
    Beaches: "Islands & Beaches",
    "Hiking & Mountains": "Hiking & Trekking",
    "Hiking & Peaks": "Hiking & Trekking",
    Hiking: "Hiking & Trekking",
    "Rivers & Lakes": "Lakes & Rivers",
    "Waterfalls & Rivers": "Waterfalls",
    "Culture & Traditions": "Culture & Heritage",
    "Culture & Festivals": "Culture & Heritage",
    "Festivals & Culture": "Culture & Heritage",
    Heritage: "Heritage & History",
    "Historical Landmarks": "Heritage & History",
    "Caves & Spelunking": "Caves",
    "Mountains & Highlands": "Mountains & Volcanoes",
    Adventure: "Adventure & Watersports",
    "Adventure & Adrenaline": "Adventure & Watersports",
    "Wildlife & Marine Life": "Wildlife & Nature",
    "Hot Springs": "Hot Springs & Wellness",
    "Wellness & Hot Springs": "Hot Springs & Wellness",
    "Wellness & Springs": "Hot Springs & Wellness",
    "Food & Delicacies": "Food & Drink",
  },
};

/** Canonical subcategory for a (site category, raw subcategory) pair. */
export function canonicalSubcategory(
  categoryKey: string,
  subcategory: string | null | undefined,
): string | null {
  if (!subcategory) return null;
  return MERGES[categoryKey]?.[subcategory] ?? subcategory;
}
