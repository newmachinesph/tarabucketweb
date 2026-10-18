// Geocodes catalog_items via Nominatim (OpenStreetMap) into lat/lng for the /map page.
//
// Run: npm run db:geocode
// - Respects Nominatim's usage policy: 1 request/second, identifying User-Agent.
// - Results (hits AND misses) are cached in geocode-cache.json, committed to the repo,
//   so re-runs and re-seeds cost zero network calls for known queries.
// - Idempotent: skips rows that already have coordinates (pass --force to redo all).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { isNull, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { catalogItems } from "./schema";

const CACHE_PATH = resolve(process.cwd(), "src/db/geocode-cache.json");
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "TaraBucketWeb/1.0 (catalog geocoder; contact: admin@tarabucket.ph)";
const FORCE = process.argv.includes("--force");

// Philippines bounding box — a hit outside it is a wrong match (e.g. a same-named
// town abroad), treated as a miss so the fallback query runs instead.
const PH = { minLat: 4.0, maxLat: 21.5, minLng: 114.0, maxLng: 127.5 };

type CacheEntry = { lat: number; lng: number } | null;
type Cache = Record<string, CacheEntry>;

const cache: Cache = existsSync(CACHE_PATH)
  ? (JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Cache)
  : {};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let lastRequest = 0;
async function geocode(query: string): Promise<CacheEntry> {
  if (query in cache) return cache[query];

  // Nominatim policy: max 1 req/s.
  const wait = 1100 - (Date.now() - lastRequest);
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();

  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=ph&q=${encodeURIComponent(query)}`;
  let entry: CacheEntry = null;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      const hits = (await res.json()) as { lat: string; lon: string }[];
      if (hits[0]) {
        const lat = Number(hits[0].lat);
        const lng = Number(hits[0].lon);
        const inPh =
          lat >= PH.minLat && lat <= PH.maxLat && lng >= PH.minLng && lng <= PH.maxLng;
        if (inPh) entry = { lat, lng };
      }
    } else {
      console.warn(`  HTTP ${res.status} for "${query}"`);
      if (res.status === 429) await sleep(10_000);
    }
  } catch (err) {
    console.warn(`  fetch failed for "${query}":`, (err as Error).message);
    return null; // transient — don't cache, retry on next run
  }
  cache[query] = entry;
  return entry;
}

/** Most-specific-first list of query strings for one item. */
function queriesFor(it: {
  place: string | null;
  province: string | null;
  region: string | null;
}): string[] {
  const qs: string[] = [];
  if (it.place && it.province) qs.push(`${it.place}, ${it.province}, Philippines`);
  if (it.place && !it.province && it.region) qs.push(`${it.place}, ${it.region}, Philippines`);
  if (it.place) qs.push(`${it.place}, Philippines`);
  if (it.province) qs.push(`${it.province}, Philippines`);
  if (it.region) qs.push(`${it.region}, Philippines`);
  return qs;
}

async function main() {
  const rows = await db
    .select({
      id: catalogItems.id,
      place: catalogItems.place,
      province: catalogItems.province,
      region: catalogItems.region,
    })
    .from(catalogItems)
    .where(FORCE ? undefined : isNull(catalogItems.lat))
    .orderBy(sql`${catalogItems.province} nulls last`);

  console.log(`Geocoding ${rows.length} items (${Object.keys(cache).length} cached queries)...`);

  let hits = 0;
  let misses = 0;
  let done = 0;
  for (const it of rows) {
    done++;
    const queries = queriesFor(it);
    if (queries.length === 0) {
      misses++; // no location text at all — nothing to geocode
      continue;
    }
    let coords: CacheEntry = null;
    for (const q of queries) {
      coords = await geocode(q);
      if (coords) break;
    }
    if (coords) {
      await db
        .update(catalogItems)
        .set({ lat: coords.lat, lng: coords.lng })
        .where(eq(catalogItems.id, it.id));
      hits++;
    } else {
      misses++;
      console.log(`  MISS ${it.id} (${queries[0]})`);
    }
    if (done % 25 === 0) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
      console.log(`  ${done}/${rows.length} (${hits} placed, ${misses} missed)`);
    }
  }

  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
  console.log(`Done. ${hits} geocoded, ${misses} without coordinates.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Geocode failed:", err);
  process.exit(1);
});
