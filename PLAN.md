# Tara Bucket — Competitive Plan: AI Travel Planning & Booking

_Drafted 2026-07-28 · companion to `AUDIT.md` (which covers engineering debt; this covers product)._

A competitor is building a **full-stack AI travel booking app** (web + mobile). This
document extracts their feature set, maps it against what Tara Bucket already has, and
lays out a phased plan to compete — by leaning into what they don't have: a curated
879-item Philippine experiences catalog, an SEO content engine, and a community.

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
| Booking workflow | None (catalog is browse-only) | ❌ Missing |
| Payments | None | ❌ Missing |
| Notifications / email | Newsletter signups stored in DB, no ESP wired | 🟡 Partial |
| Maps / geolocation | Region/province/place structured in schema; no map UI | 🟡 Partial |
| Monitoring / release cadence | Vercel-style deploys; no error/analytics tooling | 🟡 Partial |

**Read on the matchup:** they start from zero on supply and content and must buy every
visitor; we start with proprietary supply data (the catalog), organic search traffic,
and an emotional hook (the bucket list). Our gaps are accounts → AI → booking, in that
order — and each phase below unlocks the next.

---

## 3. Strategy

1. **Don't out-generalize them.** A generic "AI plans your trip anywhere" app competes
   with Google, Expedia, and every GPT wrapper. We own **the Philippines**, end-to-end:
   the deepest catalog, the best guides, the community.
2. **Ground AI in our catalog (RAG), not in the model's imagination.** An itinerary
   built from 879 verified experiences with real cost bands, durations, difficulty, and
   editorial links is defensible; a hallucinated one is not. This is the single biggest
   differentiation opportunity.
3. **Monetize with lead-gen before building an OTA.** Full booking + payments is the
   most expensive, riskiest phase. Affiliate/lead-gen (Klook, Agoda, 12Go, local
   operators) validates demand with near-zero build cost, then direct booking follows
   for the segments where we have leverage (local operators the big OTAs ignore).
4. **The bucket list is the retention loop they can't copy.** Check-offs, progress
   ("41/879 done"), shareable lists — a booking app has no reason to come back to
   between trips; a bucket list does.

---

## 4. Phased roadmap

### Phase 0 — Accounts & sync (the prerequisite) · ~2 weeks
Everything downstream (AI personalization, bookings, notifications) needs identity.

- Reader accounts: magic-link email auth (extend existing `iron-session` plumbing;
  add `readers` table or a role on `users`).
- Server-synced bucket lists: migrate `lib/local-store.ts` boards to Postgres with a
  one-time localStorage import on first login. Public shareable list URLs.
- "I did this" check-offs → progress profile (X/879, per-region completion).
- Wire the newsletter to a real ESP (Resend) with double opt-in — this becomes the
  notification rail for Phases 2–3.

### Phase 1 — AI trip planner, grounded in the catalog · ~4 weeks
- **Smart itinerary generation:** "5 days in Palawan, mid budget, no diving" → a
  day-by-day plan assembled **only from catalog items**, using the `region`,
  `costBand`, `duration`, `difficulty` fields already in the schema. Output is an
  editable bucket-list board (reuses the existing builder UI).
- **RAG over our own corpus:** embed catalog items + published guides (Neon supports
  `pgvector`); the planner cites and links our articles — every AI answer deepens SEO
  engagement instead of leaking it.
- **Personalized recommendations:** "because you checked off X" rails on home/explore,
  driven by check-offs and saves from Phase 0.
- **Automated trip planning v1:** seasonal awareness (typhoon season, festival dates —
  add `bestMonths`/`festival` data to the catalog), route-sane day ordering by
  province adjacency.
- **Feedback loop:** thumbs up/down per generated plan, stored and reviewed — mirrors
  the competitor's "improve AI from user feedback," but our corrections improve a
  proprietary dataset, not a prompt.

### Phase 2 — Booking & payments · ~6 weeks, gated on Phase 1 traction
- **Step 1 — affiliate/lead-gen (week 1–2):** outbound booking links per experience
  (Klook/Agoda/12Go + operator contact), tracked. Zero inventory risk; instantly makes
  every itinerary "bookable"; produces demand data telling us **what** to book directly.
- **Step 2 — direct booking for local operators (weeks 3–6):** request-to-book flow
  (date, pax, contact) → operator confirms → payment. Start with 10–20 hand-picked
  operators from the catalog's most-saved items.
- **Payments:** PayMongo or Xendit — PH-native gateways with **GCash, Maya, GrabPay,
  and cards**. (Stripe alone under-serves Filipino travelers; e-wallets are the
  default payment method domestically.)
- **Confirmations & notifications:** booking emails via the Phase-0 ESP; booking
  history and status in the account; ICS calendar attachment per booking.
- **Trust & safety:** clear refund/cancellation policy, operator vetting checklist,
  admin dashboard tile for booking ops (extend existing admin).

### Phase 3 — Mobile parity, maps & growth loop · ongoing
- **Mobile:** ship accounts, synced lists, and the AI planner to the existing mobile
  app (shared API routes; the web's API layer becomes the backend). We match their
  "web + mobile" story without a rewrite.
- **Map view of the catalog and of each itinerary** (region/province/place already
  structured; add lat/lng to `catalogItems`). Browse-by-map is a natural bucket-list UI.
- **Social loop:** shareable progress cards (`html-to-image` is already a dependency),
  public itineraries indexed for SEO ("5-day Siargao itinerary" pages compound).
- **Ops:** error monitoring (Sentry), product analytics (PostHog), and a weekly
  release cadence — match their stated velocity.

---

## 5. Feature-for-feature counters

| They ship | We counter with |
|---|---|
| AI itinerary from an LLM's world knowledge | AI itinerary from 879 verified PH experiences + our guides, with citations |
| Generic recommendations | Recommendations from your actual bucket list & check-offs |
| Book-anything OTA ambitions | Curated bookable experiences + affiliate coverage for the rest |
| Stripe/PayPal | GCash/Maya/GrabPay via PayMongo/Xendit — how Filipinos actually pay |
| User accounts | Accounts **plus** a progress identity (X/879) worth coming back to |
| Web + mobile from scratch | Existing web + existing mobile app, one shared backend |
| Weekly releases | Same, with an SEO content engine they don't have |

## 6. Explicit non-goals

- **No flight/hotel aggregation.** Capital-intensive, brutal margins, Agoda/Trip.com
  own it. Link out instead.
- **No global expansion until PH is won.** Depth beats breadth here.
- **No AI chatbot for its own sake.** The planner is a tool with structured output
  (an itinerary board), not an open-ended chat.

## 7. Sequencing rationale & risks

- Phase 0 before AI: personalization without identity is a demo, not a product.
- AI before booking: the planner generates the intent data that tells us which
  bookings to build; booking-first means guessing at supply.
- Biggest risk: booking ops (operator reliability, refunds) — mitigated by the
  affiliate-first step and a small hand-picked operator cohort.
- Engineering-debt prerequisites from `AUDIT.md` (caching, rate limiting, RBAC) are
  already fixed — the platform is ready to carry accounts and payments.
