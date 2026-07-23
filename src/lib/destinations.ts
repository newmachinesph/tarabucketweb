// Destination guides. Images use proven-reliable Unsplash photo IDs.
export type Destination = {
  slug: string;
  name: string;
  region: string;
  emoji: string;
  tagline: string;
  blurb: string[];
  hero: string;
  gallery: string[];
  facts: { label: string; value: string }[];
  tags: string[];
};

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

export const DESTINATIONS: Destination[] = [
  {
    slug: "el-nido",
    name: "El Nido",
    region: "Palawan",
    emoji: "🏝",
    tagline: "Limestone cliffs, hidden lagoons, and the bluest water in the country.",
    blurb: [
      "El Nido is the poster child of Philippine island-hopping, and it earns it. Karst cliffs rise straight out of turquoise water, and the lagoons hidden between them feel like secrets you paddled into.",
      "Base yourself in town or on a quieter beach, then pick a tour (A to D) or charter a private bangka to skip the crowds.",
    ],
    hero: U("1519046904884-53103b34b206", 1600),
    gallery: [U("1507525428034-b723cf961d3e"), U("1519046904884-53103b34b206"), U("1502680390469-be75c86b636f")],
    facts: [
      { label: "Best time", value: "Nov to May (dry season)" },
      { label: "Getting there", value: "Fly to El Nido or Puerto Princesa" },
      { label: "Known for", value: "Big & Small Lagoon, island tours" },
      { label: "Stay", value: "2 to 4 nights" },
    ],
    tags: ["islands", "beaches", "kayaking"],
  },
  {
    slug: "siargao",
    name: "Siargao",
    region: "Surigao del Norte",
    emoji: "🏄",
    tagline: "The surf capital that became everyone's favourite slow island.",
    blurb: [
      "Cloud 9 put Siargao on the map, but the island keeps people for the rock pools, palm-lined roads, and the easiest pace in the country.",
      "Learn to surf on the beach breaks, motorbike to Sugba Lagoon, and end every day with a sunset at Maasin River.",
    ],
    hero: U("1502680390469-be75c86b636f", 1600),
    gallery: [U("1520942702018-0862200e6873"), U("1507525428034-b723cf961d3e"), U("1519046904884-53103b34b206")],
    facts: [
      { label: "Best time", value: "Mar to Oct (surf: Sep to Nov)" },
      { label: "Getting there", value: "Fly to Sayak (IAO)" },
      { label: "Known for", value: "Cloud 9, Sugba Lagoon" },
      { label: "Stay", value: "3 to 5 nights" },
    ],
    tags: ["surf", "islands", "lagoon"],
  },
  {
    slug: "vigan",
    name: "Vigan",
    region: "Ilocos Sur",
    emoji: "🏛",
    tagline: "A UNESCO-listed Spanish colonial town best seen before the tour buses.",
    blurb: [
      "Vigan is one of the best-preserved colonial towns in Asia. Walk Calle Crisologo at 6am, when the cobblestones are quiet and the light is gold.",
      "Ride a kalesa, watch pots thrown at a burnay pottery, and eat your weight in Vigan longganisa and empanada.",
    ],
    hero: U("1591017403286-fd8493524e1e", 1600),
    gallery: [U("1596797038530-2c107229654b"), U("1533105079780-92b9be482077"), U("1552465011-b4e21bf6e79a")],
    facts: [
      { label: "Best time", value: "Nov to Feb (cooler)" },
      { label: "Getting there", value: "Bus or fly to Laoag, then drive" },
      { label: "Known for", value: "Calle Crisologo, empanada" },
      { label: "Stay", value: "1 to 2 nights" },
    ],
    tags: ["heritage", "food", "history"],
  },
  {
    slug: "banaue",
    name: "Banaue & Batad",
    region: "Ifugao",
    emoji: "🌾",
    tagline: "Two-thousand-year-old rice terraces carved into the Cordillera.",
    blurb: [
      "The Banaue and Batad terraces are hand-carved amphitheatres of rice, still farmed today. Batad's stone-walled bowl is the postcard, reached by a short but steep trek.",
      "Hire a local guide, stay in a simple homestay, and wake early for the terraces in morning mist.",
    ],
    hero: U("1552465011-b4e21bf6e79a", 1600),
    gallery: [U("1519046904884-53103b34b206"), U("1591017403286-fd8493524e1e"), U("1507525428034-b723cf961d3e")],
    facts: [
      { label: "Best time", value: "Feb to Apr, or harvest (Jun)" },
      { label: "Getting there", value: "Night bus from Manila to Banaue" },
      { label: "Known for", value: "Batad amphitheatre, Tappiya Falls" },
      { label: "Stay", value: "2 nights" },
    ],
    tags: ["nature", "hiking", "heritage"],
  },
  {
    slug: "cebu",
    name: "Cebu",
    region: "Central Visayas",
    emoji: "🌊",
    tagline: "Canyoneering, whale sharks, and lechon in one busy island.",
    blurb: [
      "Cebu packs a lot in: jump and swim through Kawasan's turquoise canyons in the south, snorkel with sardines in Moalboal, then eat the best lechon of your life.",
      "The city is a real hub, so it is easy to combine with Bohol or Siquijor.",
    ],
    hero: U("1520942702018-0862200e6873", 1600),
    gallery: [U("1502680390469-be75c86b636f"), U("1552465011-b4e21bf6e79a"), U("1596797038530-2c107229654b")],
    facts: [
      { label: "Best time", value: "Jan to May" },
      { label: "Getting there", value: "Fly to Mactan-Cebu (CEB)" },
      { label: "Known for", value: "Kawasan, Oslob, lechon" },
      { label: "Stay", value: "3 to 4 nights" },
    ],
    tags: ["adventure", "food", "diving"],
  },
  {
    slug: "bohol",
    name: "Bohol",
    region: "Central Visayas",
    emoji: "🍫",
    tagline: "Chocolate Hills, tarsiers, and the white sand of Panglao.",
    blurb: [
      "Bohol is the easy-going all-rounder: the surreal Chocolate Hills inland, tiny tarsiers in the forest, and Panglao's beaches and dive sites just across a bridge.",
      "Cruise the Loboc River, then base on Panglao for Balicasag's reefs.",
    ],
    hero: U("1519046904884-53103b34b206", 1600),
    gallery: [U("1507525428034-b723cf961d3e"), U("1519046904884-53103b34b206"), U("1502680390469-be75c86b636f")],
    facts: [
      { label: "Best time", value: "Nov to May" },
      { label: "Getting there", value: "Fly to Bohol-Panglao (TAG)" },
      { label: "Known for", value: "Chocolate Hills, tarsiers, Panglao" },
      { label: "Stay", value: "3 nights" },
    ],
    tags: ["nature", "beaches", "diving"],
  },
];

export function destinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}
