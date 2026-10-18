import type { CategoryKey } from "@/lib/categories";

/**
 * Static destination corpus for the trip planner and the map.
 *
 * Deliberately separate from — and much smaller than — the 879-item catalog in Postgres.
 * Two reasons:
 *
 *  1. It keeps /plan and /map fully static: no database, no API keys, no network. They
 *     build and render anywhere.
 *  2. It carries fields the catalog doesn't have yet (coordinates, best months, day
 *     budgets, peso estimates) — the exact fields Phase 1 of PLAN.md adds to
 *     `catalogItems`. This file is the shape that migration is aiming at, and the fixture
 *     the RAG pipeline gets validated against.
 *
 * Peso figures are rough per-person costs in 2026 terms, meant for relative comparison
 * inside a plan, not for quoting anyone a price.
 */

export type Slot = "short" | "half-day" | "full-day";

export type PlannerExperience = {
  id: string;
  title: string;
  categoryKey: CategoryKey;
  slot: Slot;
  costBand: "free" | "budget" | "mid" | "splurge";
  /** Approximate per-person cost in PHP. */
  php: number;
  blurb: string;
};

export type IslandGroup = "Luzon" | "Visayas" | "Mindanao";

export type PlannerDestination = {
  slug: string;
  name: string;
  region: string;
  islandGroup: IslandGroup;
  lat: number;
  lng: number;
  /** How you actually get there. */
  gateway: string;
  /** Months (1-12) this destination is at its best. */
  bestMonths: number[];
  /** Days most people should give it before the returns drop off. */
  suggestedDays: number;
  blurb: string;
  experiences: PlannerExperience[];
};

/** Relative time cost of each slot size, in a day budget of 3 (relaxed) to 6 (packed).
 *  Tuned so a full day trip plus a short evening thing fits a "balanced" day, and a
 *  relaxed day tops out at one real activity. */
export const SLOT_COST: Record<Slot, number> = {
  short: 1,
  "half-day": 2,
  "full-day": 3,
};

export const DESTINATIONS_PLAN: PlannerDestination[] = [
  {
    slug: "el-nido",
    name: "El Nido",
    region: "Palawan",
    islandGroup: "Luzon",
    lat: 11.196,
    lng: 119.416,
    gateway: "Fly to El Nido (ENI) or Puerto Princesa, then a 5-hour van",
    bestMonths: [11, 12, 1, 2, 3, 4, 5],
    suggestedDays: 3,
    blurb: "Limestone cliffs, hidden lagoons, and the bluest water in the country.",
    experiences: [
      { id: "en-tour-a", title: "Tour A: Big & Small Lagoon", categoryKey: "travel", slot: "full-day", costBand: "mid", php: 1400, blurb: "The postcard. Go on the first boat out or share it with three hundred people." },
      { id: "en-tour-c", title: "Tour C: hidden beaches & Matinloc Shrine", categoryKey: "travel", slot: "full-day", costBand: "mid", php: 1500, blurb: "The better tour if you've seen a lagoon before — secret beach, dramatic shrine." },
      { id: "en-nacpan", title: "Sunset at Nacpan Beach", categoryKey: "nature", slot: "half-day", costBand: "budget", php: 500, blurb: "Four kilometres of empty gold sand, half an hour of tricycle away." },
      { id: "en-taraw", title: "Climb Taraw Cliff at sunrise", categoryKey: "adventure", slot: "short", costBand: "budget", php: 700, blurb: "Sharp karst, real scrambling, and the whole bay underneath you." },
      { id: "en-kayak", title: "Kayak Big Lagoon at opening", categoryKey: "adventure", slot: "half-day", costBand: "budget", php: 900, blurb: "The lagoon before the tour boats arrive — worth the alarm." },
      { id: "en-cabanas", title: "Las Cabanas zipline over the bay", categoryKey: "adventure", slot: "short", costBand: "budget", php: 600, blurb: "Short, silly, and the sunset from the far side is the real prize." },
    ],
  },
  {
    slug: "coron",
    name: "Coron",
    region: "Palawan",
    islandGroup: "Luzon",
    lat: 12.005,
    lng: 120.204,
    gateway: "Fly to Busuanga (USU), or ferry from El Nido",
    bestMonths: [11, 12, 1, 2, 3, 4, 5],
    suggestedDays: 3,
    blurb: "Emerald lakes ringed by limestone, and the best wreck diving in Asia.",
    experiences: [
      { id: "co-kayangan", title: "Kayangan Lake", categoryKey: "nature", slot: "full-day", costBand: "mid", php: 1500, blurb: "The cleanest lake in the country, up a short steep boardwalk." },
      { id: "co-barracuda", title: "Freedive Barracuda Lake", categoryKey: "adventure", slot: "half-day", costBand: "mid", php: 2000, blurb: "A thermocline you can feel — cold, then suddenly bath-warm at depth." },
      { id: "co-wrecks", title: "Dive the WWII wrecks", categoryKey: "adventure", slot: "full-day", costBand: "splurge", php: 4500, blurb: "A dozen Japanese ships sunk in 1944, most within recreational depth." },
      { id: "co-maquinit", title: "Maquinit Hot Springs after dark", categoryKey: "nature", slot: "short", costBand: "budget", php: 300, blurb: "Saltwater hot springs by the mangroves. Go late, go quiet." },
      { id: "co-tapyas", title: "Mt. Tapyas steps at sunset", categoryKey: "adventure", slot: "short", costBand: "free", php: 0, blurb: "Seven hundred-odd steps for the whole archipelago laid out below." },
      { id: "co-malcapuya", title: "Malcapuya & Banana island hop", categoryKey: "travel", slot: "full-day", costBand: "mid", php: 1800, blurb: "Further out, far emptier, better sand than the standard tour." },
    ],
  },
  {
    slug: "puerto-princesa",
    name: "Puerto Princesa",
    region: "Palawan",
    islandGroup: "Luzon",
    lat: 9.74,
    lng: 118.736,
    gateway: "Fly to Puerto Princesa (PPS) — the main Palawan hub",
    bestMonths: [11, 12, 1, 2, 3, 4, 5],
    suggestedDays: 2,
    blurb: "Palawan's gateway city, and the way in to the Underground River.",
    experiences: [
      { id: "pp-underground", title: "Puerto Princesa Underground River", categoryKey: "nature", slot: "full-day", costBand: "mid", php: 2000, blurb: "A navigable river inside a mountain. Permits sell out — book days ahead." },
      { id: "pp-honda", title: "Honda Bay island hop", categoryKey: "travel", slot: "full-day", costBand: "budget", php: 1300, blurb: "Three sandbars and a snorkel stop, easy and close in." },
      { id: "pp-firefly", title: "Iwahig firefly watching", categoryKey: "nature", slot: "short", costBand: "budget", php: 700, blurb: "Paddle a mangrove river under trees lit like circuit boards." },
      { id: "pp-tamilok", title: "Try tamilok at a local kamayan", categoryKey: "food", slot: "short", costBand: "budget", php: 800, blurb: "Mangrove woodworm, eaten raw in vinegar. Tastes like oyster. Mostly." },
      { id: "pp-bakers", title: "Baker's Hill & Mitra's Ranch", categoryKey: "travel", slot: "short", costBand: "budget", php: 100, blurb: "Unapologetically touristy, genuinely good hopia, big view off the ridge." },
    ],
  },
  {
    slug: "siargao",
    name: "Siargao",
    region: "Surigao del Norte",
    islandGroup: "Mindanao",
    lat: 9.848,
    lng: 126.046,
    gateway: "Fly to Sayak (IAO) from Manila, Cebu, or Clark",
    bestMonths: [3, 4, 5, 6, 8, 9, 10, 11],
    suggestedDays: 4,
    blurb: "The surf capital that became everyone's favourite slow island.",
    experiences: [
      { id: "sg-cloud9", title: "Surf lesson at Cloud 9", categoryKey: "adventure", slot: "half-day", costBand: "budget", php: 1000, blurb: "Warm water, patient instructors, a reef break that made the island famous." },
      { id: "sg-sugba", title: "Paddleboard Sugba Lagoon", categoryKey: "nature", slot: "full-day", costBand: "mid", php: 1500, blurb: "Impossible green water and a diving board nobody uses gracefully." },
      { id: "sg-magpupungko", title: "Magpupungko rock pools at low tide", categoryKey: "nature", slot: "half-day", costBand: "budget", php: 800, blurb: "Tide-dependent — check the table, the pools only exist a few hours a day." },
      { id: "sg-islands", title: "Naked, Daku & Guyam island hop", categoryKey: "travel", slot: "full-day", costBand: "mid", php: 1600, blurb: "One sandbar, one lunch island, one you can walk around in four minutes." },
      { id: "sg-maasin", title: "Maasin River palm at sunset", categoryKey: "nature", slot: "short", costBand: "budget", php: 100, blurb: "The leaning coconut palm with the rope swing. Yes, that one." },
      { id: "sg-pacifico", title: "Motorbike the palm road to Pacifico", categoryKey: "travel", slot: "half-day", costBand: "budget", php: 500, blurb: "The island's best hour of road, coconut walls both sides the whole way." },
    ],
  },
  {
    slug: "cebu",
    name: "Cebu",
    region: "Central Visayas",
    islandGroup: "Visayas",
    lat: 10.317,
    lng: 123.891,
    gateway: "Fly to Mactan-Cebu (CEB) — the country's second hub",
    bestMonths: [1, 2, 3, 4, 5, 12],
    suggestedDays: 4,
    blurb: "Canyoneering, sardine clouds, and the best lechon in the country.",
    experiences: [
      { id: "cb-kawasan", title: "Canyoneering to Kawasan Falls", categoryKey: "adventure", slot: "full-day", costBand: "mid", php: 1800, blurb: "Three hours of jumping and swimming down a turquoise canyon in Badian." },
      { id: "cb-sardines", title: "Snorkel the sardine run, Moalboal", categoryKey: "nature", slot: "half-day", costBand: "budget", php: 1200, blurb: "Millions of sardines, twenty metres off the beach. No boat needed." },
      { id: "cb-osmena", title: "Sunrise at Osmeña Peak", categoryKey: "adventure", slot: "half-day", costBand: "budget", php: 600, blurb: "Cebu's highest point, a short hike, jagged hills in every direction." },
      { id: "cb-lechon", title: "Lechon in Carcar", categoryKey: "food", slot: "short", costBand: "budget", php: 400, blurb: "Where Cebuanos actually go for it. Buy it by the kilo at the market." },
      { id: "cb-basilica", title: "Magellan's Cross & the Santo Niño Basilica", categoryKey: "culture", slot: "short", costBand: "free", php: 0, blurb: "Where Philippine Christianity started, in 1521. Still packed every Friday." },
      { id: "cb-sirao", title: "Sirao flower garden", categoryKey: "travel", slot: "short", costBand: "budget", php: 200, blurb: "Celosia fields in the hills above the city. Peak season is around September." },
    ],
  },
  {
    slug: "bohol",
    name: "Bohol",
    region: "Central Visayas",
    islandGroup: "Visayas",
    lat: 9.578,
    lng: 123.751,
    gateway: "Fly to Bohol-Panglao (TAG), or ferry two hours from Cebu",
    bestMonths: [11, 12, 1, 2, 3, 4, 5],
    suggestedDays: 3,
    blurb: "Chocolate Hills, tarsiers, and Panglao's reefs on one easy island.",
    experiences: [
      { id: "bh-chocolate", title: "Chocolate Hills viewpoint", categoryKey: "nature", slot: "half-day", costBand: "budget", php: 800, blurb: "Twelve hundred near-identical mounds. Brown only in the dry months." },
      { id: "bh-tarsier", title: "Tarsier sanctuary at Corella", categoryKey: "nature", slot: "short", costBand: "budget", php: 300, blurb: "Go to the Corella sanctuary, not a roadside cage — the difference is real." },
      { id: "bh-loboc", title: "Loboc River lunch cruise", categoryKey: "food", slot: "short", costBand: "mid", php: 900, blurb: "Buffet on a raft with a live rondalla. Corny, and everyone enjoys it." },
      { id: "bh-balicasag", title: "Snorkel Balicasag's reef wall", categoryKey: "nature", slot: "full-day", costBand: "mid", php: 1800, blurb: "Turtles and a vertical drop-off, a short bangka ride off Panglao." },
      { id: "bh-danao", title: "Canyon swing at Danao Adventure Park", categoryKey: "adventure", slot: "half-day", costBand: "mid", php: 1200, blurb: "A 200-metre freefall swing into a river gorge. Exactly as bad as it sounds." },
      { id: "bh-alona", title: "Alona Beach at sunset", categoryKey: "travel", slot: "short", costBand: "free", php: 0, blurb: "Busy, but the light on the water at six is worth standing in a crowd for." },
    ],
  },
  {
    slug: "boracay",
    name: "Boracay",
    region: "Aklan",
    islandGroup: "Visayas",
    lat: 11.969,
    lng: 121.925,
    gateway: "Fly to Caticlan (MPH), then a 15-minute boat",
    bestMonths: [11, 12, 1, 2, 3, 4, 5],
    suggestedDays: 3,
    blurb: "The most famous white sand in the country, cleaned up and rule-bound now.",
    experiences: [
      { id: "bo-paraw", title: "Sunset paraw sail off White Beach", categoryKey: "travel", slot: "short", costBand: "mid", php: 900, blurb: "The outrigger sailboat with the orange sail. Best twenty minutes on the island." },
      { id: "bo-puka", title: "Morning at Puka Beach", categoryKey: "nature", slot: "half-day", costBand: "budget", php: 300, blurb: "Coarser shell sand, far fewer people, north end of the island." },
      { id: "bo-kite", title: "Kitesurf at Bulabog", categoryKey: "adventure", slot: "half-day", costBand: "splurge", php: 3500, blurb: "The windward side, and one of Asia's best flat-water kite spots (Nov-Apr)." },
      { id: "bo-ariels", title: "Cliff jumping at Ariel's Point", categoryKey: "adventure", slot: "full-day", costBand: "splurge", php: 3000, blurb: "Five platforms up to 15 metres, on the mainland across the channel." },
      { id: "bo-hop", title: "Island hop to Crystal Cove", categoryKey: "travel", slot: "full-day", costBand: "mid", php: 1500, blurb: "Snorkel stops and two sea caves you climb down into." },
    ],
  },
  {
    slug: "baguio",
    name: "Baguio",
    region: "Benguet",
    islandGroup: "Luzon",
    lat: 16.402,
    lng: 120.596,
    gateway: "Four to six hours by bus from Manila",
    bestMonths: [11, 12, 1, 2, 3],
    suggestedDays: 2,
    blurb: "The summer capital — pine air, cold mornings, and February's flower festival.",
    experiences: [
      { id: "bg-panagbenga", title: "Panagbenga float parade", categoryKey: "festivals", slot: "full-day", costBand: "free", php: 0, blurb: "The flower festival, last weekend of February. Book a room months out." },
      { id: "bg-bencab", title: "BenCab Museum", categoryKey: "culture", slot: "half-day", costBand: "budget", php: 150, blurb: "The country's best private art museum, with a garden falling down the hillside." },
      { id: "bg-burnham", title: "Burnham Park in the morning", categoryKey: "travel", slot: "short", costBand: "budget", php: 200, blurb: "Rowboats, bikes, and the entire city out walking before eight." },
      { id: "bg-strawberry", title: "Strawberry taho on Session Road", categoryKey: "food", slot: "short", costBand: "budget", php: 300, blurb: "Warm tofu, sago, and strawberry syrup instead of the usual caramel." },
      { id: "bg-ukay", title: "The ukay-ukay run", categoryKey: "culture", slot: "short", costBand: "budget", php: 500, blurb: "Baguio invented Philippine thrifting. Bring patience and small bills." },
      { id: "bg-ulap", title: "Day hike up Mt. Ulap", categoryKey: "adventure", slot: "full-day", costBand: "budget", php: 900, blurb: "Grassy ridgelines an hour out in Itogon. Start early, the clouds come in by noon." },
    ],
  },
  {
    slug: "sagada",
    name: "Sagada",
    region: "Mountain Province",
    islandGroup: "Luzon",
    lat: 17.083,
    lng: 120.9,
    gateway: "Six hours by van from Baguio, on a road worth staying awake for",
    bestMonths: [11, 12, 1, 2, 3, 4],
    suggestedDays: 3,
    blurb: "Pine ridges, hanging coffins, and the cave system underneath all of it.",
    experiences: [
      { id: "sa-coffins", title: "Hanging coffins of Echo Valley", categoryKey: "culture", slot: "half-day", costBand: "budget", php: 400, blurb: "A living Igorot burial practice, not a ruin. Go with a local guide, quietly." },
      { id: "sa-sumaguing", title: "The cave connection: Lumiang to Sumaguing", categoryKey: "adventure", slot: "full-day", costBand: "mid", php: 1000, blurb: "Four hours underground, barefoot on wet limestone. Genuinely hard." },
      { id: "sa-kiltepan", title: "Kiltepan sunrise sea of clouds", categoryKey: "nature", slot: "short", costBand: "budget", php: 400, blurb: "Leave at 4:30. The valley fills with cloud and the peaks float on it." },
      { id: "sa-bomodok", title: "Trek to Bomod-ok Falls", categoryKey: "adventure", slot: "full-day", costBand: "budget", php: 700, blurb: "Down through rice terraces to a big cold plunge pool, then back up." },
      { id: "sa-lemonpie", title: "Lemon pie and mountain coffee", categoryKey: "food", slot: "short", costBand: "budget", php: 250, blurb: "The pie is the local institution. The coffee is grown down the road." },
    ],
  },
  {
    slug: "banaue",
    name: "Banaue & Batad",
    region: "Ifugao",
    islandGroup: "Luzon",
    lat: 16.911,
    lng: 121.058,
    gateway: "Night bus from Manila to Banaue, then a jeep to the Batad saddle",
    bestMonths: [2, 3, 4, 6, 11, 12],
    suggestedDays: 2,
    blurb: "Two-thousand-year-old rice terraces, still farmed by the people who cut them.",
    experiences: [
      { id: "bn-batad", title: "The Batad amphitheatre viewpoint", categoryKey: "nature", slot: "half-day", costBand: "budget", php: 800, blurb: "Stone-walled terraces in a perfect bowl. The steep walk in is the point." },
      { id: "bn-tappiya", title: "Trek to Tappiya Falls", categoryKey: "adventure", slot: "full-day", costBand: "budget", php: 900, blurb: "An hour down through the terraces to a 70-metre falls, then an hour back up." },
      { id: "bn-sunrise", title: "Banaue viewpoint at sunrise", categoryKey: "nature", slot: "short", costBand: "budget", php: 200, blurb: "The view on the back of the old twenty-peso note, with mist in it." },
      { id: "bn-homestay", title: "A night in an Ifugao homestay", categoryKey: "culture", slot: "short", costBand: "budget", php: 900, blurb: "Simple rooms, home cooking, and the people who maintain the terraces." },
      { id: "bn-hiwang", title: "Walk the Hiwang village terraces", categoryKey: "culture", slot: "half-day", costBand: "budget", php: 500, blurb: "A gentler terrace walk with a native Ifugao house still standing in it." },
    ],
  },
  {
    slug: "vigan",
    name: "Vigan",
    region: "Ilocos Sur",
    islandGroup: "Luzon",
    lat: 17.574,
    lng: 120.387,
    gateway: "Night bus from Manila, or fly to Laoag and drive 90 minutes",
    bestMonths: [11, 12, 1, 2],
    suggestedDays: 2,
    blurb: "The best-preserved Spanish colonial town in Asia, best seen at 6am.",
    experiences: [
      { id: "vg-crisologo", title: "Calle Crisologo before the crowds", categoryKey: "culture", slot: "short", costBand: "free", php: 0, blurb: "Cobblestones, no cars, gold light. After nine it's a different street." },
      { id: "vg-kalesa", title: "Kalesa ride through the mestizo district", categoryKey: "culture", slot: "short", costBand: "budget", php: 400, blurb: "Horse-drawn, forty minutes, and the driver knows which houses matter." },
      { id: "vg-burnay", title: "Throw a pot at a burnay pottery", categoryKey: "culture", slot: "short", costBand: "budget", php: 300, blurb: "Unglazed jars fired the same way since the 1700s, with a carabao mixing clay." },
      { id: "vg-empanada", title: "Longganisa and empanada crawl", categoryKey: "food", slot: "short", costBand: "budget", php: 350, blurb: "Garlicky sausage and an orange rice-flour empanada cracked open on the spot." },
      { id: "vg-bantay", title: "Bantay Bell Tower at sunset", categoryKey: "culture", slot: "short", costBand: "free", php: 0, blurb: "Climb the tower next door for the whole valley and the church roofline." },
    ],
  },
  {
    slug: "batanes",
    name: "Batanes",
    region: "Batanes",
    islandGroup: "Luzon",
    lat: 20.449,
    lng: 121.97,
    gateway: "Fly to Basco (BSO) from Manila or Clark — weather-dependent",
    bestMonths: [3, 4, 5, 6],
    suggestedDays: 4,
    blurb: "Stone houses, hedgerow hills, and the emptiest roads in the Philippines.",
    experiences: [
      { id: "bt-north", title: "North Batan and Valugan boulder beach", categoryKey: "nature", slot: "full-day", costBand: "mid", php: 1800, blurb: "A beach of andesite boulders thrown up by Mt. Iraya, smoothed by the Pacific." },
      { id: "bt-marlboro", title: "Racuh a Payaman (Marlboro Country)", categoryKey: "nature", slot: "half-day", costBand: "mid", php: 1200, blurb: "Communal pasture on a cliff over the sea. Cows, wind, nothing else." },
      { id: "bt-sabtang", title: "Sabtang Island and Chavayan's stone houses", categoryKey: "culture", slot: "full-day", costBand: "mid", php: 2200, blurb: "A faluwa boat across a rough channel to Ivatan villages built for typhoons." },
      { id: "bt-lighthouse", title: "Basco lighthouse at sunset", categoryKey: "travel", slot: "short", costBand: "free", php: 0, blurb: "Climb it, then watch the light go across Mt. Iraya and the whole north coast." },
      { id: "bt-pacita", title: "Lunch on the Fundacion Pacita terrace", categoryKey: "food", slot: "short", costBand: "splurge", php: 1500, blurb: "A painter's old house on a ridge, and the finest view from any table in the country." },
    ],
  },
  {
    slug: "camiguin",
    name: "Camiguin",
    region: "Northern Mindanao",
    islandGroup: "Mindanao",
    lat: 9.174,
    lng: 124.729,
    gateway: "Ferry from Balingoan (Misamis Oriental), or fly to Camiguin (CGM)",
    bestMonths: [2, 3, 4, 5, 10, 11],
    suggestedDays: 3,
    blurb: "Seven volcanoes on an island you can circle in two hours.",
    experiences: [
      { id: "cm-white", title: "White Island sandbar at sunrise", categoryKey: "nature", slot: "short", costBand: "budget", php: 500, blurb: "A bare white sandbar with Hibok-Hibok volcano behind it. No shade at all." },
      { id: "cm-sunken", title: "The Sunken Cemetery cross", categoryKey: "culture", slot: "short", costBand: "budget", php: 300, blurb: "A graveyard pushed underwater by the 1871 eruption, marked by a big white cross." },
      { id: "cm-katibawasan", title: "Katibawasan Falls", categoryKey: "nature", slot: "short", costBand: "budget", php: 100, blurb: "A 70-metre single drop into a very cold pool, five minutes from the road." },
      { id: "cm-ardent", title: "Ardent hot springs after dark", categoryKey: "nature", slot: "short", costBand: "budget", php: 150, blurb: "Volcano-heated pools in the forest. Best at night, when it's finally cool out." },
      { id: "cm-mantigue", title: "Snorkel off Mantigue Island", categoryKey: "nature", slot: "half-day", costBand: "budget", php: 900, blurb: "A tiny forested island with a steep reef drop-off on the far side." },
      { id: "cm-lanzones", title: "Lanzones Festival", categoryKey: "festivals", slot: "full-day", costBand: "free", php: 0, blurb: "Third week of October, for the fruit the island is known for." },
    ],
  },
  {
    slug: "siquijor",
    name: "Siquijor",
    region: "Central Visayas",
    islandGroup: "Visayas",
    lat: 9.199,
    lng: 123.515,
    gateway: "Ferry from Dumaguete (about an hour) or Bohol",
    bestMonths: [2, 3, 4, 5, 11, 12],
    suggestedDays: 2,
    blurb: "The island Filipinos call enchanted — folk healers, waterfalls, empty roads.",
    experiences: [
      { id: "sq-cambugahay", title: "Rope swing at Cambugahay Falls", categoryKey: "adventure", slot: "half-day", costBand: "budget", php: 200, blurb: "Three tiers of blue water and a Tarzan swing everyone queues for." },
      { id: "sq-salagdoong", title: "Cliff jump at Salagdoong Beach", categoryKey: "adventure", slot: "half-day", costBand: "budget", php: 300, blurb: "Two platforms, 10 and 20 feet, into clear water off the east coast." },
      { id: "sq-balete", title: "The century-old balete tree fish spa", categoryKey: "nature", slot: "short", costBand: "budget", php: 100, blurb: "A 400-year-old tree with a spring under it, full of very willing small fish." },
      { id: "sq-healer", title: "Visit a folk healer in San Antonio", categoryKey: "culture", slot: "short", costBand: "budget", php: 500, blurb: "Bolo-bolo healing, still practised. Go respectfully, or don't go." },
      { id: "sq-paliton", title: "Sunset at Paliton Beach", categoryKey: "nature", slot: "short", costBand: "free", php: 0, blurb: "Palms, white sand, and the best sunset on the island. Locals call it Little Boracay." },
      { id: "sq-loop", title: "Circle the island by scooter", categoryKey: "travel", slot: "full-day", costBand: "budget", php: 600, blurb: "72 kilometres of coastal road. You can do it in a day and stop everywhere." },
    ],
  },
  {
    slug: "davao",
    name: "Davao",
    region: "Davao Region",
    islandGroup: "Mindanao",
    lat: 7.19,
    lng: 125.455,
    gateway: "Fly to Francisco Bangoy (DVO)",
    bestMonths: [3, 4, 5, 8, 10, 11, 12],
    suggestedDays: 3,
    blurb: "The country's highest peak, its rarest eagle, and its most divisive fruit.",
    experiences: [
      { id: "dv-apo", title: "Trek Mt. Apo", categoryKey: "adventure", slot: "full-day", costBand: "mid", php: 4000, blurb: "The highest point in the Philippines at 2,954m. Three days, permits required." },
      { id: "dv-eagle", title: "Philippine Eagle Center", categoryKey: "nature", slot: "half-day", costBand: "budget", php: 200, blurb: "A critically endangered eagle with a two-metre wingspan, seen up close." },
      { id: "dv-durian", title: "Eat durian at Magsaysay Park", categoryKey: "food", slot: "short", costBand: "budget", php: 200, blurb: "Buy it by the kilo where the stalls line up. Puyat if you want the good stuff." },
      { id: "dv-samal", title: "Island hop to Samal", categoryKey: "travel", slot: "full-day", costBand: "mid", php: 1500, blurb: "White beaches and a giant bat cave, a short ferry from the city." },
      { id: "dv-kadayawan", title: "Kadayawan Festival", categoryKey: "festivals", slot: "full-day", costBand: "free", php: 0, blurb: "Third week of August — harvest, indigenous culture, and street dancing." },
    ],
  },
  {
    slug: "la-union",
    name: "La Union",
    region: "Ilocos Region",
    islandGroup: "Luzon",
    lat: 16.678,
    lng: 120.331,
    gateway: "Five hours by bus from Manila to San Juan",
    bestMonths: [10, 11, 12, 1, 2, 3],
    suggestedDays: 2,
    blurb: "Manila's weekend surf town — beginner waves, good coffee, no pressure.",
    experiences: [
      { id: "lu-surf", title: "Surf lesson at Urbiztondo", categoryKey: "adventure", slot: "half-day", costBand: "budget", php: 700, blurb: "The easiest beginner break within reach of Manila. Swell peaks October to March." },
      { id: "lu-tangadan", title: "Trek and jump at Tangadan Falls", categoryKey: "adventure", slot: "half-day", costBand: "budget", php: 500, blurb: "A short river hike in San Gabriel to a wide falls with a jumping ledge." },
      { id: "lu-grapes", title: "Grape picking in Bauang", categoryKey: "food", slot: "short", costBand: "budget", php: 250, blurb: "Small family vineyards, open roughly March to May. Unexpected, and real." },
      { id: "lu-cafes", title: "Café-hop through Elyu", categoryKey: "food", slot: "short", costBand: "budget", php: 400, blurb: "The surf town's other economy — genuinely good roasters along the highway." },
      { id: "lu-macho", title: "Ma-Cho Temple", categoryKey: "culture", slot: "short", costBand: "free", php: 0, blurb: "A Taoist temple on a hill over the gulf, gaudy and quiet at the same time." },
    ],
  },
  {
    slug: "manila",
    name: "Manila",
    region: "Metro Manila",
    islandGroup: "Luzon",
    lat: 14.59,
    lng: 120.975,
    gateway: "Fly to Ninoy Aquino (MNL) — most trips start or end here",
    bestMonths: [12, 1, 2, 3],
    suggestedDays: 2,
    blurb: "Most trips pass through. Give it a day and it stops being just an airport.",
    experiences: [
      { id: "mn-intramuros", title: "Bamboo bike tour of Intramuros", categoryKey: "culture", slot: "half-day", costBand: "budget", php: 1200, blurb: "The walled city on a bamboo-framed bike, with a guide who knows the 1945 history." },
      { id: "mn-santiago", title: "Fort Santiago and the Rizal Shrine", categoryKey: "culture", slot: "short", costBand: "budget", php: 75, blurb: "The cell where Rizal spent his last night, and his final poem's hiding place." },
      { id: "mn-binondo", title: "Binondo food crawl", categoryKey: "food", slot: "half-day", costBand: "budget", php: 900, blurb: "The oldest Chinatown in the world. Come hungry, start at the Ongpin end." },
      { id: "mn-museum", title: "National Museum of Fine Arts", categoryKey: "culture", slot: "half-day", costBand: "free", php: 0, blurb: "Free entry, and Luna's Spoliarium takes up an entire wall." },
      { id: "mn-baywalk", title: "Manila Bay sunset from the baywalk", categoryKey: "travel", slot: "short", costBand: "free", php: 0, blurb: "A famously good sunset over a famously troubled bay. Both things are true." },
      { id: "mn-escolta", title: "Escolta's art deco arcades", categoryKey: "culture", slot: "short", costBand: "budget", php: 200, blurb: "Faded 1930s commercial grandeur, slowly filling with galleries again." },
    ],
  },
];

export function plannerDestinationBySlug(slug: string): PlannerDestination | undefined {
  return DESTINATIONS_PLAN.find((d) => d.slug === slug);
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
