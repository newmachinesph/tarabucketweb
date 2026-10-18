# Tara Bucket — Competitive Plan: AI Trip Planning, Affiliate-First

_Drafted 2026-07-28 · companion to `AUDIT.md` (which covers engineering debt; this covers product)._

A competitor is building a **full-stack AI travel booking app** (web + mobile). This
document extracts their feature set, maps it against what Tara Bucket already has, and
lays out a phased plan to compete.

> **Positioning: we are not a travel agency.** We do not hold inventory, take payment,
> issue tickets, or carry cancellation liability. We are the Philippine bucket-list
> journal — we help people decide *what* to do, then hand them off to a partner who
> handles the transaction. Monetization is **affiliate commission and sponsorship**, not
> booking margin. Everything below is built on that constraint.

---

## 1. Competitor feature extraction

Stripped of hiring/tech criteria, they are building:

**Platform**
- Travel booking application on **web and mobile**
- User accounts

**AI**
- Smart itinerary generation
- Personalized travel recommendations
- Automated trip planning
- AI improved continuously from user feedback (they also signal RAG / AI agents)

**Booking & payments**
- Full booking workflow: search → select → pay → confirmation
- Payment gateway integration (Stripe/PayPal-class)
- Booking confirmations + notifications
- Booking management inside the user account

**Adjacent**
- Mapping / geolocation / travel-API integration, itinerary management
- Weekly release cadence, production monitoring

---

## 2. Where Tara Bucket stands today

| Competitor feature | Tara Bucket today | Status |
|---|---|---|
| Web app | Next.js 16 site, live | ✅ Have |
| Mobile app | Sibling mobile app exists (brand tokens ported from it) | ✅ Have |
| Travel content / discovery | Blog + CMS, 879-item catalog, explore-by-region, destinations, collections | ✅ Have — **stronger than theirs** |
| User accounts | Admin/editor only; readers are anonymous | ❌ Missing |
| Itinerary building | Bucket-list builder + templates, but localStorage-only, no days/scheduling | 🟡 Partial |
| AI itinerary / recommendations / trip planning | None | ❌ Missing |
| Booking workflow | None (catalog is browse-only) | ⚪️ **Out of scope by choice** — affiliate hand-off instead |
| Payments | None | ⚪️ **Out of scope by choice** — partners take payment |
| Notifications / email | Newsletter signups stored in DB, no ESP wired | 🟡 Partial |
| Maps / geolocation | Region/province/place structured in schema; no map UI | 🟡 Partial |
| Monitoring / release cadence | Vercel-style deploys; no error/analytics tooling | 🟡 Partial |

**Read on the matchup:** they start from zero on supply and content and must buy every
visitor; we start with proprietary supply data (the catalog), organic search traffic, and
an emotional hook (the bucket list). Our real gaps are accounts → AI → affiliate
hand-off, in that order.

---

## 3. Strategy

1. **Don't out-generalize them.** A generic "AI plans your trip anywhere" app competes
   with Google, Expedia, and every LLM wrapper. We own **the Philippines**, end-to-end:
   the deepest catalog, the best guides, the community.
2. **Ground AI in our catalog (RAG), not in the model's imagination.** An itinerary built
   from 879 verified experiences with real cost bands, durations, difficulty, and
   editorial links is defensible; a hallucinated one is not. This is the single biggest
   differentiation opportunity.
3. **Affiliate is the business model, not a stepping stone.** The competitor is taking on
   payments, refunds, chargebacks, operator vetting, and cancellation liability — a
   travel-agency cost structure with travel-agency risk. We take a commission for sending
   qualified, high-intent traffic and carry none of it. Their hardest phase is one we
   simply never build.
4. **The bucket list is the retention loop they can't copy.** Check-offs, progress
   ("41/879 done"), shareable lists — a booking app has no reason to be opened between
   trips; a bucket list does.

**Why affiliate wins here specifically.** Our traffic is *pre-decision* — people
browsing what to do someday, not people with dates and a credit card out. That audience
converts poorly on a checkout and beautifully on inspiration → partner hand-off. A
booking funnel bolted onto a bucket-list site would cannibalize the thing that makes the
site good.

---

## 4. Phased roadmap

### Phase 0 — Accounts & sync (the prerequisite) · ~2 weeks
Everything downstream (AI personalization, saved trips, notifications) needs identity.

- Reader accounts: magic-link email auth (extend existing `iron-session` plumbing; add a
  `readers` table or a role on `users`).
- Server-synced bucket lists: migrate `lib/local-store.ts` boards to Postgres with a
  one-time localStorage import on first login. Public shareable list URLs.
- "I did this" check-offs → progress profile (X/879, per-region completion).
- Wire the newsletter to a real ESP (Resend) with double opt-in — this becomes the
  notification rail for later phases.

### Phase 1 — AI trip planner, grounded in the catalog · ~4 weeks
- **Smart itinerary generation:** "5 days in Palawan, mid budget, no diving" → a
  day-by-day plan assembled **only from catalog items**, using the `region`, `costBand`,
  `duration`, and `difficulty` fields already in the schema. Output is an editable
  bucket-list board (reuses the existing builder UI).
- **RAG over our own corpus:** embed catalog items + published guides (Neon supports
  `pgvector`); the planner cites and links our articles — every AI answer deepens
  engagement on our own pages instead of leaking it.
- **Personalized recommendations:** "because you checked off X" rails on home/explore,
  driven by check-offs and saves from Phase 0.
- **Seasonality:** typhoon season, festival dates, and best-months awareness; route-sane
  day ordering by province adjacency.
- **Feedback loop:** thumbs up/down per generated plan, stored and reviewed. Mirrors the
  competitor's "improve AI from user feedback," but our corrections improve a proprietary
  dataset, not a prompt.

### Phase 2 — Affiliate hand-off & monetization · ~3 weeks
Replaces the competitor's booking-and-payments phase entirely, at a fraction of the cost.

- **Partner links per experience and per itinerary.** Every experience page and every
  generated day plan gets contextual "book this" links to the partner best suited to it:
  tours and activities (Klook, GetYourGuide, Guide to the Philippines), stays (Agoda,
  Booking.com), inter-island transport (12Go). No inventory, no checkout, no refunds.
- **Trip-level hand-off:** an itinerary rolls up into "book the pieces" — one block per
  day with the right partner per line item, so a finished plan is immediately actionable.
- **Disclosure and trust:** a visible affiliate disclosure on every monetized surface plus
  a `/partners` page explaining the model. Outbound links carry `rel="sponsored"` so we
  stay compliant with search-engine guidelines and don't risk the organic traffic that is
  the whole business.
- **Attribution:** per-partner subid tags carrying the source page, so we learn which
  content earns. That data tells us what to write next — the content flywheel.
- **Later, if the data justifies it:** direct sponsorships and featured placements with
  local operators (a flat listing fee, still not a booking). This is the natural
  high-margin upgrade — and it stays inventory-free.

### Phase 3 — Mobile parity, maps & growth loop · ongoing
- **Mobile:** ship accounts, synced lists, and the AI planner to the existing mobile app
  (shared API routes; the web's API layer becomes the backend). We match their "web +
  mobile" story without a rewrite.
- **Map view of the catalog and of each itinerary** (region/province/place already
  structured; add lat/lng to `catalogItems`). Browse-by-map is a natural bucket-list UI.
- **Social loop:** shareable progress cards (`html-to-image` is already a dependency),
  public itineraries indexed for SEO ("5-day Siargao itinerary" pages compound).
- **Ops:** error monitoring (Sentry), product analytics (PostHog), and a weekly release
  cadence — match their stated velocity.

---

## 5. Feature-for-feature counters

| They ship | We counter with |
|---|---|
| AI itinerary from an LLM's world knowledge | AI itinerary from 879 verified PH experiences + our guides, with citations |
| Generic recommendations | Recommendations from your actual bucket list & check-offs |
| Book-anything OTA, built and staffed in-house | Affiliate hand-off to partners who already do it better, at zero liability |
| Payment gateway, refunds, chargebacks | Partner's problem, by design — we never touch money |
| User accounts | Accounts **plus** a progress identity (X/879) worth coming back to |
| Web + mobile from scratch | Existing web + existing mobile app, one shared backend |
| Weekly releases | Same, with an SEO content engine they don't have |

## 6. Explicit non-goals

- **No booking engine, no payments, no inventory.** We are not a travel agency. Every
  transaction happens on a partner's site, under their terms and their liability.
- **No flight/hotel aggregation.** Capital-intensive, brutal margins, Agoda/Trip.com own
  it. Link out instead.
- **No global expansion until PH is won.** Depth beats breadth here.
- **No AI chatbot for its own sake.** The planner is a tool with structured output (an
  itinerary board), not an open-ended chat.

## 7. Sequencing rationale & risks

- Phase 0 before AI: personalization without identity is a demo, not a product.
- AI before affiliate: the planner generates the high-intent moment where a partner link
  actually converts. Links sprinkled on browse pages earn far less than links on a
  finished itinerary.
- Biggest risk is **affiliate-program dependency** — approval, cookie windows, and
  commission rates are set by partners and can change unilaterally. Mitigation: spread
  across several programs from day one, never hard-code a single partner into the UI, and
  treat direct operator sponsorship as the margin upgrade once traffic justifies it.
- Second risk is **trust erosion**: affiliate links that feel like ads will cost us the
  editorial credibility that earns the traffic. Mitigation: disclose plainly, never let
  commission decide editorial ranking, and keep partner links visually secondary to the
  recommendation itself.
- Engineering-debt prerequisites from `AUDIT.md` (caching, rate limiting, RBAC) are
  already fixed — the platform is ready to carry accounts.

---

## 8. Implementation status — static frontend

A **static, backend-free** slice of this plan is now in the repo, so the product shape is
visible and testable before any infrastructure spend. The product logic below runs off a
bundled dataset — no API keys, no LLM calls, no booking infrastructure. (The catalog map
and the journal cross-links still read Postgres, as noted per row.)

| Surface | Route | What's real | What's stubbed |
|---|---|---|---|
| AI trip planner | `/plan` | Full UI, day-by-day itinerary output, save-to-bucket-list | Itinerary comes from a **deterministic rules engine** over a bundled dataset, not an LLM. Phase 1 swaps the engine for LLM + RAG over the live catalog. |
| Affiliate hand-off | `/experience/[slug]`, `/destinations/[slug]`, `/plan` | Partner registry, contextual link selection, disclosure, `rel="sponsored"`. One `BookingPanel` component renders it everywhere except the planner, which groups links **per destination** rather than per day — a 5-day Palawan trip would otherwise repeat the same partner links five times. | Affiliate IDs are placeholders — swap in real subids once programs are approved. `AffiliateContext.source` is declared but unused until then. |
| Partner disclosure | — | The one-sentence disclosure ships on every monetized surface. | **The standalone `/partners` page was removed** in the home redesign (`9c94dc8`). Phase 2's "page explaining the model" is open; nothing links to the dead route, so there's no 404. |
| Progress profile | `/profile` | Saves, check-offs, region breakdown, share card | Stored in `localStorage`. Phase 0 moves it to Postgres behind magic-link auth. |
| Map view | `/map` | Every geocoded catalog experience on an OpenStreetMap basemap, category filters, cross-link to the destination guides | The only surface here that reads the catalog — the pins come from Postgres. |
| Destination guides | `/destinations`, `/destinations/[slug]` | Index + full page template for all 17 planner destinations: best months, cost/duration facts, experiences by category, affiliate hand-off, related posts, `TouristDestination` JSON-LD | Only the 17 in `planner-data.ts`. The ~240 curated province/city pages need the catalog — see `DESTINATIONS.md`. |

The static dataset lives in `src/lib/planner-data.ts` (17 destinations, ~90 experiences,
with coordinates, best months, and cost estimates). It is deliberately a **separate,
smaller corpus** from the 879-item catalog: it keeps these pages buildable with no
database, and it is the fixture the Phase 1 RAG pipeline gets validated against.
