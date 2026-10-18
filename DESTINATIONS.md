# Destinations — Full Philippines Coverage Plan

_Goal: a live destination page for **everything in the Philippines** — every province
(82) + NCR, **all 149 cities**, every tourist island, and auto-generated pages for any
municipality the catalog covers (727 places today, growing). Every page driven by the
Neon catalog, not hand-maintained static files. ~240 curated pages + unlimited
auto-generated place pages._

**Current state (audited 2026-07-28)**
- 6 hand-written static guides in `src/lib/destinations.ts` (El Nido, Siargao, Vigan, Banaue, Cebu, Bohol) — not connected to the catalog.
- 17 planner destinations in `src/lib/planner-data.ts` — separate list, own experiences.
- 17 region pages at `/explore/region/[region]` — catalog-driven, already fine.
- Catalog location data: 17 regions, **94 distinct `province` values** (dirty: `"Nationwide"` ×49, empty string ×19, plus spelling variants), 727 places, all 879 items geocoded (lat/lng).

---

## Phase 0 — Data hygiene (blocks everything else)

- [ ] Canonicalize `catalog_items.province`: merge spelling variants against the official 82-province list (same pattern as `subcategory-map.ts` — seed-time map + reseed).
- [ ] Reclassify the 19 empty-string provinces (derive from `place`/geocode or mark truly nationwide).
- [ ] Decide handling for `"Nationwide"` items (49): tag `province = null` + `nationwide` flag; they appear on category pages, not destination pages.
- [ ] Add `province → region` lookup table (constant in `src/lib/`) so province pages know their region without trusting per-row data.
- [ ] Verify every canonical province has ≥1 geocoded item; list gaps (provinces with zero catalog items) — these need catalog additions in Phase 3.

## Phase 1 — Route architecture

- [ ] New dynamic route `/destinations/[slug]` driven by DB + a `DESTINATION_META` config (slug, name, type: province|city|island, parent province, hero image, optional hand-written intro).
- [ ] `generateStaticParams` from the canonical province list; ISR `revalidate 3600`.
- [ ] `/destinations` index: grouped Luzon → Visayas → Mindanao, region subheads, item counts per destination, search box.
- [ ] Redirect/absorb the 6 legacy static guides (keep their prose as the `intro` field for those slugs; delete `lib/destinations.ts` after migration).
- [x] Restore "Destinations" to header nav — decided once the index went live: it takes the slot, `/map` drops to the footer + cross-links from `/destinations` and `/explore`. Header stays at seven items.

## Phase 2 — Page template (one template, all destinations)

Sections, all catalog-driven:
- [ ] Hero: name, region, item count, best-months (from planner-data where available).
- [ ] Map inset: Leaflet reusing `catalog-map.tsx`, filtered to the destination's points, auto-fit bounds.
- [ ] Top experiences: signature items first (planner-data overlap), then by category with counts; link to `/explore?province=X` for the full list (add `province` to explore filter pills — filter already supported in `lib/catalog.ts`).
- [ ] Practical facts strip: cost-band spread, duration mix, difficulty mix (SQL aggregates).
- [ ] Getting there: `gateway` text (planner-data has it for 17; add for the rest in Phase 3).
- [ ] Related journal posts via tag match (`getPostsByTags` exists).
- [ ] CTAs: "Plan a trip here" (`/plan` preselected via query param — needs small planner change to read `?destination=`) + "Save to bucket list".
- [x] SEO: canonical, OG image (+ matching Twitter card, so an X preview shows the hero and not the site logo), `TouristDestination` **and `BreadcrumbList`** JSON-LD backed by a visible breadcrumb, all slugs in `sitemap.ts`.

## Phase 3 — Content & catalog fill (the long tail)

Tiering — template renders for all; tiers control hand-written depth:
- **Tier 1 (hand-written intro + gateway, ~20):** the search heavyweights — check off when intro written.
- **Tier 2 (auto-generated intro from catalog facts):** every remaining province — check off when page renders with ≥3 items and clean data.
- [ ] Write catalog items for zero/low-coverage provinces (target: every province ≥5 items; BARMM + Eastern Visayas are the expected gaps).
- [ ] Auto-intro generator: one honest paragraph from region, counts, categories, cost spread — no invented claims.

### Tourist islands & towns (Tier 1, hand-written — not cities but the top searches)

- [ ] Sagada · [ ] Banaue & Batad · [ ] El Nido · [ ] Coron · [ ] Boracay · [ ] Moalboal · [ ] Oslob · [ ] Bantayan · [ ] Malapascua · [ ] Panglao · [ ] Siquijor (island) · [ ] Siargao · [ ] Camiguin · [ ] Batanes (Basco) · [ ] San Juan, La Union · [ ] Baler · [ ] Anilao · [ ] Donsol · [ ] Kalanggaman · [ ] Balabac

### All 149 cities (checkbox = page live with clean data)

**NCR (16)** · [ ] Manila · [ ] Quezon City · [ ] Caloocan · [ ] Las Piñas · [ ] Makati · [ ] Malabon · [ ] Mandaluyong · [ ] Marikina · [ ] Muntinlupa · [ ] Navotas · [ ] Parañaque · [ ] Pasay · [ ] Pasig · [ ] San Juan · [ ] Taguig · [ ] Valenzuela
**CAR (2)** · [ ] Baguio · [ ] Tabuk
**Region I (9)** · [ ] Laoag · [ ] Batac · [ ] Vigan · [ ] Candon · [ ] San Fernando (La Union) · [ ] Alaminos · [ ] Dagupan · [ ] San Carlos (Pangasinan) · [ ] Urdaneta
**Region II (4)** · [ ] Tuguegarao · [ ] Cauayan · [ ] Ilagan · [ ] Santiago
**Region III (15)** · [ ] Balanga · [ ] Baliwag · [ ] Malolos · [ ] Meycauayan · [ ] San Jose del Monte · [ ] Cabanatuan · [ ] Gapan · [ ] Muñoz · [ ] Palayan · [ ] San Jose · [ ] Angeles · [ ] Mabalacat · [ ] San Fernando (Pampanga) · [ ] Tarlac City · [ ] Olongapo
**Region IV-A (22)** · [ ] Batangas City · [ ] Lipa · [ ] Tanauan · [ ] Santo Tomas · [ ] Calaca · [ ] Bacoor · [ ] Carmona · [ ] Cavite City · [ ] Dasmariñas · [ ] General Trias · [ ] Imus · [ ] Tagaytay · [ ] Trece Martires · [ ] Biñan · [ ] Cabuyao · [ ] Calamba · [ ] San Pablo · [ ] San Pedro · [ ] Santa Rosa · [ ] Lucena · [ ] Tayabas · [ ] Antipolo
**MIMAROPA (2)** · [ ] Calapan · [ ] Puerto Princesa
**Region V (7)** · [ ] Legazpi · [ ] Ligao · [ ] Tabaco · [ ] Iriga · [ ] Naga (Camarines Sur) · [ ] Masbate City · [ ] Sorsogon City
**Region VI (16)** · [ ] Roxas · [ ] Iloilo City · [ ] Passi · [ ] Bacolod · [ ] Bago · [ ] Cadiz · [ ] Escalante · [ ] Himamaylan · [ ] Kabankalan · [ ] La Carlota · [ ] Sagay · [ ] San Carlos (Negros Occidental) · [ ] Silay · [ ] Sipalay · [ ] Talisay (Negros Occidental) · [ ] Victorias
**Region VII (16)** · [ ] Tagbilaran · [ ] Bogo · [ ] Carcar · [ ] Cebu City · [ ] Danao · [ ] Lapu-Lapu · [ ] Mandaue · [ ] Naga (Cebu) · [ ] Talisay (Cebu) · [ ] Toledo · [ ] Bais · [ ] Bayawan · [ ] Canlaon · [ ] Dumaguete · [ ] Guihulngan · [ ] Tanjay
**Region VIII (7)** · [ ] Borongan · [ ] Baybay · [ ] Ormoc · [ ] Tacloban · [ ] Calbayog · [ ] Catbalogan · [ ] Maasin
**Region IX (5)** · [ ] Dapitan · [ ] Dipolog · [ ] Pagadian · [ ] Zamboanga City · [ ] Isabela City
**Region X (9)** · [ ] Malaybalay · [ ] Valencia · [ ] Oroquieta · [ ] Ozamiz · [ ] Tangub · [ ] Cagayan de Oro · [ ] El Salvador · [ ] Gingoog · [ ] Iligan
**Region XI (6)** · [ ] Davao City · [ ] Panabo · [ ] Samal · [ ] Tagum · [ ] Digos · [ ] Mati
**Region XII (4)** · [ ] Kidapawan · [ ] Koronadal · [ ] General Santos · [ ] Tacurong
**Caraga (6)** · [ ] Butuan · [ ] Cabadbaran · [ ] Bayugan · [ ] Surigao City · [ ] Tandag · [ ] Bislig
**BARMM (3)** · [ ] Cotabato City · [ ] Marawi · [ ] Lamitan

### Tier 3 — Municipalities (the other 1,493 LGUs)

Not hand-listed — auto-generated. A municipality gets a page the moment the catalog
covers it:
- [ ] Place-page route (`/destinations/[province]/[place]`) auto-generated from distinct `catalog_items.place` values (727 today), same template, province page as parent.
- [ ] Canonicalize `place` values in Phase 0 (same merge-map pattern) so "Puerto Princesa" ≠ "Puerto Princesa City" duplicates never ship.
- [ ] Coverage engine: quarterly pass adding catalog items for high-search municipalities with zero items — the page inventory grows by adding *data*, never new code.
- [ ] Guard: a place page renders only with ≥1 item; no empty stub pages in the sitemap.

### Provinces — Luzon

**NCR** · [ ] Metro Manila
**CAR** · [ ] Abra · [ ] Apayao · [ ] Benguet · [ ] Ifugao · [ ] Kalinga · [ ] Mountain Province
**Region I — Ilocos** · [ ] Ilocos Norte · [ ] Ilocos Sur · [ ] La Union · [ ] Pangasinan
**Region II — Cagayan Valley** · [ ] Batanes · [ ] Cagayan · [ ] Isabela · [ ] Nueva Vizcaya · [ ] Quirino
**Region III — Central Luzon** · [ ] Aurora · [ ] Bataan · [ ] Bulacan · [ ] Nueva Ecija · [ ] Pampanga · [ ] Tarlac · [ ] Zambales
**Region IV-A — CALABARZON** · [ ] Batangas · [ ] Cavite · [ ] Laguna · [ ] Quezon · [ ] Rizal
**MIMAROPA** · [ ] Marinduque · [ ] Occidental Mindoro · [ ] Oriental Mindoro · [ ] Palawan · [ ] Romblon
**Region V — Bicol** · [ ] Albay · [ ] Camarines Norte · [ ] Camarines Sur · [ ] Catanduanes · [ ] Masbate · [ ] Sorsogon

### Provinces — Visayas

**Region VI — Western Visayas** · [ ] Aklan · [ ] Antique · [ ] Capiz · [ ] Guimaras · [ ] Iloilo · [ ] Negros Occidental
**Region VII — Central Visayas** · [ ] Bohol · [ ] Cebu · [ ] Negros Oriental · [ ] Siquijor
**Region VIII — Eastern Visayas** · [ ] Biliran · [ ] Eastern Samar · [ ] Leyte · [ ] Northern Samar · [ ] Samar · [ ] Southern Leyte

### Provinces — Mindanao

**Region IX — Zamboanga Peninsula** · [ ] Zamboanga del Norte · [ ] Zamboanga del Sur · [ ] Zamboanga Sibugay
**Region X — Northern Mindanao** · [ ] Bukidnon · [ ] Camiguin · [ ] Lanao del Norte · [ ] Misamis Occidental · [ ] Misamis Oriental
**Region XI — Davao** · [ ] Davao de Oro · [ ] Davao del Norte · [ ] Davao del Sur · [ ] Davao Occidental · [ ] Davao Oriental
**Region XII — SOCCSKSARGEN** · [ ] Cotabato · [ ] Sarangani · [ ] South Cotabato · [ ] Sultan Kudarat
**Region XIII — Caraga** · [ ] Agusan del Norte · [ ] Agusan del Sur · [ ] Dinagat Islands · [ ] Surigao del Norte · [ ] Surigao del Sur
**BARMM** · [ ] Basilan · [ ] Lanao del Sur · [ ] Maguindanao del Norte · [ ] Maguindanao del Sur · [ ] Sulu · [ ] Tawi-Tawi

> Note: catalog currently uses the 17-region structure; if we adopt the 2024 Negros
> Island Region split, do it in Phase 0's lookup table, not per-row edits.

## Phase 4 — Unification (kill the three parallel systems)

- [x] `planner-data.ts` destinations reference destination slugs (single source for name/gateway/best months) — `lib/destinations.ts` is now a merge layer over it.
- [x] Map page `DestinationDirectory` reads the same source — moved to `components/map/destination-directory.tsx`, sourced from `lib/destinations.ts`; the private `DESTINATIONS_PLAN` list, the dead `/explore?q=` fallback (every destination has a page now), and the unused `PhMap` SVG are all deleted. It renders a name list, not a second card grid — `/destinations` owns that presentation.
- [ ] Experience detail pages link to their destination page (place → province). **Catalog-blocked:** matching a catalog item to a destination needs the canonical `place`/`province` values from Phase 0.
- [ ] Region pages (`/explore/region/[region]`) link down to their province pages. **Catalog-blocked:** `planner-data`'s `region` field is a display label mixing provinces ("Palawan", "Benguet") with true regions ("Central Visayas"), so it can't be joined to `catalog_items.region` until Phase 0 ships the province → region table.

## Phase 5 — QA & launch

- [x] `next build` green — **verified 2026-07-28**: 40 routes compile, all 17 `/destinations/[slug]` prerendered as SSG (`revalidate 1h`). Re-run once the ~240 curated params land; the only build warning is an env one (`sslmode=require` is now an alias for `verify-full` and Node warns — fix in `.env`, not in code).
- [ ] Lighthouse on 3 destination pages (LCP < 2.5s — watch the map inset lazy-load).
- [ ] Sitemap + Search Console submit; verify JSON-LD with the rich-results tester.
- [ ] Broken-link sweep (legacy `/destinations/*` slugs must 301, not 404).

**Order of attack:** P0 → P1 → P2 ship together (template live for the 17 planner destinations first), then P3 fills coverage province-by-province highest-tourism-first, P4 cleanup, P5 gate before announcing.

---

## Implementation status — static slice shipped (2026-07-28)

The **backend-free slice** is in the repo: the P1 route architecture and the full P2
page template, driven by the in-repo `planner-data.ts` corpus (17 destinations) instead
of the Neon catalog. No database, no API keys — it builds and renders like `/plan` and
`/map` do. This is the "template live for the 17 planner destinations first" step from the
order of attack above.

| Surface | Route | What's real | What's still catalog-blocked |
|---|---|---|---|
| Destinations index | `/destinations` | Grouped Luzon → Visayas → Mindanao, per-group counts, per-destination experience/day counts, hero photo or tinted cover | Only the 17 planner destinations — the ~240 curated + auto place pages need the DB (P3). |
| Destination template | `/destinations/[slug]` | Hero, intro, best-months strip, facts strip (cost spread + duration mix, both computed from experiences), experiences grouped by category, affiliate hand-off (`affiliateLinksForDestination`, `rel="sponsored"`), related journal posts, `TouristDestination` JSON-LD, `generateStaticParams` + `revalidate 3600`, CTAs to plan/bucket-list | Map inset (needs per-experience coords in `catalogItems`); auto-intro generator for the long tail. |
| Planner deep-link | `/plan?destination=<slug>` | "Plan a trip here" seeds the planner with the destination | — |

**How it was built (single source of truth):** `lib/destinations.ts` was repurposed from six
hand-written static guides into a merge layer over `planner-data.ts` — facts come from the
planner corpus, and a small `CONTENT` map adds real hero photos + hand-written intros +
curated tags for the six that had guides. A destination with no `CONTENT` entry still gets a
full page (tinted cover, planner blurb, tags derived from its experience categories) — the
Tier-2 auto-generated behaviour, so **adding a destination is a data edit in
`planner-data.ts`, not new code.** `sitemap.ts` and the map directory pick up all 17
automatically. Verified with `tsc --noEmit` + `eslint` (both green) and, as of the third pass, a real
`next build` — `DATABASE_URL` is present and points at Neon, so the full build does run here.

**P4 unification (2026-07-28, second pass).** The parallel destination lists are gone: the map
page's private directory was deleted along with the unused `PhMap` SVG, and its replacement
reads `lib/destinations.ts` like every other surface — one list, one place to edit. `Destinations`
took the header-nav slot; `/map` is reachable from the footer and from a cross-link on the
gazetteer index. The two remaining P4 items (experience → destination, region → province) are
catalog-blocked and annotated above. Verified with `tsc --noEmit` + `eslint` (both green).

**Quality pass (2026-07-28, third pass).** Four real defects in the shipped slice, found by
re-reading it against `AUDIT.md` rather than by adding features:

- **Images were raw `<img>`.** AUDIT.md's M6 deferred the `next/image` migration because
  *editor-supplied* post covers can be any host and `next/image` throws on non-allowlisted
  ones. Destination heroes are ours and always `images.unsplash.com` — already allowlisted in
  `next.config.ts` — so the deferral never applied to them. Hero, index covers, and the
  "keep exploring" thumbs now use `next/image` with `fill` + `sizes`; the hero carries
  `priority` (it's the LCP element) and the first index row is eager, the rest lazy. Reserved
  boxes mean no layout shift.
- **The best-months strip failed WCAG 1.4.1.** Good vs off-season was carried by fill colour
  with the detail hidden in a `title` attribute, which screen readers don't reliably announce
  and touch users never see. Each month is now a list item with its status as `sr-only` text,
  plus a visible legend.
- **`"2 shorts"`.** The duration mix pluralised its labels by appending `s`, and `short` is
  not a noun that survives that. Now "quick stop" / "quick stops".
- **Three copies of the affiliate hand-off.** `/destinations/[slug]` had its own markup while
  `components/affiliate/booking-panel.tsx` already existed and only `/experience/[slug]` used
  it. Consolidated onto `BookingPanel`; `destinationAffiliateContext()` in `lib/affiliates.ts`
  is now the single definition of a destination's partner context. The planner keeps its own
  layout on purpose — it groups links per destination, and nesting a panel per destination
  would repeat the disclosure four times in one trip.

Guarded by `npm run check` (`src/lib/destinations.check.ts`): assertions over every
`destinationFacts` formatting branch, the merge-layer fallbacks, slug uniqueness, and the
hero-host constraint that `next/image` enforces at runtime but TypeScript can't. No test
framework added — the project has none, and one runner for two pure functions costs more
than it protects.

**Discoverability pass (2026-07-28, fourth pass).** SEO / AEO / GEO, favicons, and OG:

- **Canonicals on all 20 public routes** (only 4 had them). `/explore` was the real problem:
  six filter dimensions multiply into a huge set of indexable URLs all serving slices of one
  catalog, so filtered views now canonicalise to `/explore` and carry `noindex, follow` —
  crawl budget stops being spent enumerating combinations.
- **Structured data.** Site-wide `Organization` + `WebSite`/`SearchAction` in the root layout
  (publisher identity and the sitelinks searchbox); per-destination `FAQPage` backed by a
  **visible** "Common questions" block, since marked-up answers Google can't see are a manual
  action risk.
- **AEO answer block.** Each destination page opens with one self-contained paragraph —
  region, days, best months as a real range ("November to April", not twelve chips), cost
  spread, gateway. Answer engines quote passages that stand alone; this is derived from the
  same data the page renders, so it can't drift from it.
- **GEO.** `/llms.txt` (generated from the destination list, so it can't go stale) states what
  the site is authoritative for and — deliberately — that the planner is a rules engine, not
  an LLM. Answer-engine crawlers are now named explicitly in `robots.ts`: behaviour is
  unchanged, but excluding one later becomes a deliberate edit instead of a side effect.
- **OG + favicons.** Every page had been pointing social previews at the logo PNG, which
  crops badly everywhere. Now real 1200×630 cards generated by `next/og` — destinations use
  the hero photo cropped server-side by Unsplash to exact dimensions, everything else gets a
  branded generated card. Favicon/apple-icon/manifest/theme-color are generated too, so
  there's no binary to keep in sync.
- **Caught a live footgun:** `NEXT_PUBLIC_SITE_URL` is `http://localhost:3000` in `.env` and
  is inlined at **build** time. Every canonical, sitemap URL, OG `url`, and JSON-LD `@id` is
  built from it, so a deploy that doesn't override it ships a site telling search engines it
  lives on localhost — silently. `lib/site.ts` now warns loudly during any production build
  where it resolves to localhost. **This must be set in the deploy environment.**

**Not done here:** everything that needs the **catalog data** — P0 data hygiene, the
province/city/municipality pages from the 879-item catalog, per-experience map insets, and the
coverage fill. The Neon DB is reachable (the build reads it), but the catalog seeding lives in
the sibling `all-bucket-list` repo, which isn't in this environment — and `db:seed:catalog`
writes to a live database, so it isn't something to run speculatively.
