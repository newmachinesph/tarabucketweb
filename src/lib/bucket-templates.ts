// Pre-made bucket lists. Pure data — no images (keeps flashcard export CORS-clean).
export type BucketTemplate = {
  id: string;
  title: string;
  emoji: string;
  tagalog: string;
  accent: string; // hex
  blurb: string;
  items: string[];
};

export const BUCKET_TEMPLATES: BucketTemplate[] = [
  {
    id: "top-street-foods",
    title: "Top Filipino Street Foods",
    emoji: "🍢",
    tagalog: "Pagkain sa Kanto",
    accent: "#FF5A36",
    blurb: "The must-try roster of Pinoy sidewalk classics.",
    items: [
      "Isaw (grilled chicken/pork intestines)",
      "Kwek-kwek (orange battered quail eggs)",
      "Fishball with sweet-and-spicy sauce",
      "Betamax (grilled pork blood)",
      "Banana cue",
      "Taho (warm silken tofu, sago, arnibal)",
      "Balut",
      "Kikiam",
      "Chicken skin",
      "Sorbetes (dirty ice cream)",
    ],
  },
  {
    id: "island-hopping",
    title: "Ultimate Island Hopping",
    emoji: "🏝",
    tagalog: "Island Hopping",
    accent: "#14A3E1",
    blurb: "The islands worth reordering your whole list for.",
    items: [
      "El Nido, Palawan",
      "Coron & Kayangan Lake",
      "Siargao",
      "Bantayan Island, Cebu",
      "Batanes",
      "Camiguin",
      "Siquijor",
      "Balabac sandbars",
      "Boracay at sunrise",
      "Sila Island, Northern Samar",
    ],
  },
  {
    id: "festivals",
    title: "Festivals to Experience",
    emoji: "🎉",
    tagalog: "Mga Pista",
    accent: "#FF4D67",
    blurb: "One fiesta worth chasing for every season.",
    items: [
      "Sinulog (Cebu)",
      "Ati-Atihan (Kalibo)",
      "MassKara (Bacolod)",
      "Panagbenga (Baguio)",
      "Pahiyas (Lucban)",
      "Dinagyang (Iloilo)",
      "Kadayawan (Davao)",
      "Giant Lantern Festival (Pampanga)",
      "Moriones (Marinduque)",
    ],
  },
  {
    id: "adventures",
    title: "Bucket-List Adventures",
    emoji: "🧗",
    tagalog: "Pakikipagsapalaran",
    accent: "#22C58B",
    blurb: "Earn the stories. Warm water, patient guides.",
    items: [
      "Learn to surf at Cloud 9, Siargao",
      "Canyoneer at Kawasan Falls, Cebu",
      "Dive Tubbataha Reefs",
      "Climb Mt. Pulag for the sea of clouds",
      "Freedive in Panglao",
      "Swim with butanding (whale sharks)",
      "Trek to Batad Rice Terraces",
      "Ride the Chocolate Hills at sunrise",
      "Underground River, Puerto Princesa",
    ],
  },
  {
    id: "comfort-foods",
    title: "Filipino Comfort Foods",
    emoji: "🍲",
    tagalog: "Lutong Bahay",
    accent: "#F4B740",
    blurb: "The dishes that taste like home.",
    items: [
      "Adobo",
      "Sinigang na baboy",
      "Lechon",
      "Kare-kare",
      "Sisig",
      "Halo-halo",
      "Pancit (any kind)",
      "Bulalo",
      "Crispy pata",
      "Bibingka & puto bumbong",
    ],
  },
  {
    id: "nature-wonders",
    title: "Nature Wonders of the PH",
    emoji: "🌋",
    tagalog: "Kalikasan",
    accent: "#0EA5A5",
    blurb: "The postcards that are even better in person.",
    items: [
      "Chocolate Hills, Bohol",
      "Banaue & Batad Rice Terraces",
      "Mayon Volcano",
      "Hinatuan Enchanted River",
      "Kawasan Falls",
      "Sumaguing Cave, Sagada",
      "Masungi Georeserve",
      "Taal Volcano",
      "Apo Reef",
    ],
  },
];

export function templateById(id: string): BucketTemplate | undefined {
  return BUCKET_TEMPLATES.find((t) => t.id === id);
}
