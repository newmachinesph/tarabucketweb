# Tara Bucket — Viral 2027

_Drafted 2026-07-28 · companion to `PLAN.md` (product roadmap) and `DESTINATIONS.md` (coverage plan). This is a plan, not a build — nothing here is implemented._

_Method: 11-agent research fleet — 5 web researchers (viral mechanics, PH social/travel culture, PH tourism 2027, competitors, distribution), 4 ideators, an adversarial skeptic, and a completeness critic. 36 ideas generated; 7 survived the skeptic; 3 were explicitly killed; the critic added the infrastructure the ideators missed. Sources inline._

---

## 1. The strategic read

Five facts decide the whole plan:

1. **The market is domestic and it lives in the group chat.** Domestic travelers generated **82.3% of PH tourism spend in 2025** (₱3.26T); international arrivals missed target badly (6.48M vs 8.4M). Filipinos are the world's most social-media-saturated market (95.8M users, 81.9% of population; FB reaches **94.9% of internet users**; ~4h50m/day). Trip planning happens in Messenger/Viber GCs and 1M-member FB groups (DIY Travel Philippines), not on Google. **Every share object must be engineered for the GC first, IG second, Twitter never.**
2. **The completion-flex culture already exists.** #Project81 / Philippine Travel Masters (visit all 82 provinces) is an established prestige identity — Filipinos already perform "X/82" publicly. "41/879 done" is not a new behavior we teach; it's a legible flex we productize. This is the rarest asset: Wrapped, Strava, and Letterboxd all had to *manufacture* a countable identity metric. We were born with one.
3. **Content SEO is a decaying channel; the identity tool and the dataset are not.** Organic CTR drops **61%** when an AI Overview appears (Seer, 25M impressions); travel publishers report 50–70% traffic declines; The Planet D shut down. What survives: interactive tools people return to, proprietary data AI engines must cite (Reddit ≈40% of LLM citations; earned media 84%; own-domain only ~3%), and programmatic pages over structured data (Wanderlog: public itineraries = 60%+ of 7.2M monthly visits; Nomad List; Wise). Honest correction to our own work: **llms.txt is a measured dud** — Ahrefs found 97% of files never requested; keep ours as a free checkbox, invest nothing more.
4. **Nobody owns "bucket list" as a category — and generic AI planning is a trap.** Mindtrip ($22.5M) pivoting B2B; Layla planned $1B in trips for **$2.8M ARR**; hallucinated places are the #1 user complaint; Google/OpenAI are absorbing generic planning. Polarsteps (15M→20M users, zero paid acquisition) proves the winning shape: **travel memory as an identity artifact**. "been" (3M users) proves count-tracking demand and proves the fatal mistake — paywalling the count. The open lane, globally unoccupied: *identity layer on a hallucination-proof country-scoped catalog, distributed by share objects and creators, monetized by hand-off.*
5. **2027 hands us a ready-made calendar.** Sinulog + Ati-Atihan land on the **same day (Jan 17, 2027)**; WSL World Longboard Tour La Union (Jan); FIBA Women's Asia Cup Cebu (Jul 10–18); WSL Championship Tour at Cloud 9, Siargao (~Oct 31–Nov 10); MassKara (Oct); SEA Plus Youth Games Manila/Tagaytay/Clark (Dec 2–14). Cebu is the epicenter year. Klook's own data: Filipino creators drove **76% of its global affiliate-program revenue** — PH affiliate economics work, and creators (not blogs) are the channel.

**The thesis in one line:** make "X/879" (and "X/82 provinces") the number Filipino travelers show off, put the share moment inside the group chat, anchor the year on two synchronized drops (January Hit List, December Wrapped), and let proprietary data earn the press and AI citations that content SEO can no longer buy.

---

## 2. The spine (in order — later pieces don't work without earlier ones)

The skeptic's core finding: every share card silently depends on a **sub-2-minute path for the viewer to get their own number**. Ship in this order or the loops don't close.

| # | Mechanic | Why it's load-bearing |
|---|---|---|
| 0 | **Save My List** + wire the ESP | The anti-flop mechanic. The entire identity asset lives in wipeable localStorage — and Messenger opens links in its own webview, the *exact surface we target*. "Email me my list" = restore link + future account-claim token + the owned channel every later drop assumes exists. |
| 0 | **879 Pages** (programmatic item SEO) | Not viral itself — the landing infrastructure that converts everyone else's virality. A page per catalog item (best months, peso band, difficulty, gateway, nearby, FAQ schema, affiliate links). Every share object deep-links to item pages, never the homepage. The Wanderlog/Nomad List play on data we already have. |
| 0 | **Anonymous check-off event log** | One unauthenticated POST per check-off, starting now. Feeds rarity tiers, percentiles, Wrapped aggregates, and the Tara Index later — all of which are fiction without months of real events. Costs a table. |
| 1 | **The 879 Quiz** ("How many have you done?") | The activation keystone. 90-second swipe through ~60 iconic items → instant score card + starter grid + provisional archetype, seeding a real localStorage list. The quiz IS onboarding. Every other share object points here. Score is instantly comparable ("I got 34, you?") so the quiz re-shares itself in the same GC thread. |
| 2 | **Scratch-Map ng Pilipinas** | The flagship share object: 82-province silhouette, visited = full color, untouched = foil gray, "X/82 · Y/879" + QR. Speaks the #Project81 flex Filipinos already perform. IG-story, FB-square, and phone-wallpaper exports (the map lives on the lock screen between trips). Gray provinces are the affiliate upsell surface. **Never paywall the map or the count** ("been"'s fatal error). |
| 3 | **Barkada Board** | The GC-native mechanic: a shared list behind one unguessable URL — no auth, one token-keyed table. Dropped into a Messenger GC, one link mints 5–12 users. Attacks the universally-memed "trip that dies in the GC" (coordination, not motivation, is the bottleneck — and *tara* is literally the brand). Unchecked items render with booking links: a group in planning mode is the highest-intent affiliate surface we will ever have. Hard rule: keep it dumb, or it drags the accounts roadmap forward. |
| 4 | **2027 Hit List** (Jan 1) + **PH Travel Wrapped** (Dec) | The two dates the community synchronizes on. January: pledge-card drop ("my 2027 hit list") — cold-start friendly, works with zero history, blank-template mode rides the proven PH IG-bingo remix mechanic, and mid-year "3/8 na!" re-shares echo all year. December: the earned bookend — swipeable recap (items, provinces unlocked, rarest done, peso "adventure value," archetype). We're one of the few legitimate "Wrapped for X" candidates because check-offs are genuinely year-round tracked behavior — the substrate the 2025 copycat wave lacked. **Conditional: Wrapped ships only if an active tracked base exists by October; thin-data users get routed to the next Hit List, never a sad recap. Build in October — December is a 3-person team's holiday.** |

Everything else in this document hangs off this spine.

## 3. The rest of the strong seven

**Bridge Hunter** (long-weekend optimizer + proclamation-day ambush) — input your leave days, get every 2027 bridge ("file Aug 20, get 5 days") paired with 3 in-season catalog picks and peso bands. Launch within hours of Malacañang signing the 2027 holiday proclamation — a guaranteed annual national trending moment where every newsroom posts the same static list and we post the interactive answer. Office GCs share leave plans to coordinate group filing. Dated destination intent = the sharpest affiliate hand-off in the plan (Agoda for those dates, 12Go, Klook). ⚠️ **The proclamation typically lands Aug–Oct — build this now (it's July).** Obligation: same-day updates when holidays get amended, or the tool prints wrong plans.

**The Least-Visited Province** (monthly series + annual ranking) — monthly love letter to the province with the fewest arrivals crossed with what the catalog says is actually there ("Apayao gets 0.1% of visitors. Here are 9 reasons that's insane."). Every January: **The Philippine Province Rankings** — all 82 ranked by bucket-list density, cost, under-visitedness, methodology published. Province pride is the most reliable engagement lever in PH internet life — ranking cards trigger hometown-defense comment storms from people who never travel, and the annual report is the Strava-style proprietary-data play: nobody owns PH travel numbers, so it earns the press, backlinks, and AI citations that compound the catalog's authority. Frame as love letter, never dunk.

## 4. Fill the gaps the ideators missed (from the completeness critic)

- **Sticker Trail** — QR sticker packs for hostels/cafes/surf shops across the 17 guide destinations: "Scan to stamp El Nido — 2,314 travelers stamped here." Scanning at the location = *location-verified* check-off, which is also the cheapest partial answer to leaderboard gaming. The live counter flatters the venue into keeping it visible. Natural LGU/tourism-office handshake. Offline was entirely absent from all 36 ideas; for a brand whose product is *places*, presence at the places is the cheapest unlisted distribution. TravelTour Expo (Feb 2027, the country's biggest) is the calendar anchor.
- **The Tara Index** — quarterly "State of the Philippine Bucket List" from the anonymous event log: most-saved vs most-done, fastest-rising provinces, demand heat. Public layer = citable data journalism. Private layer = one-page PDFs per operator/tourism board ("1,847 trackers have Siquijor saved; 212 have gone") — **the sponsorship pitch that sells attention data, not bookings**, so the no-agency line holds. The only idea on the board that grows the revenue side.
- **First-Timer's 21** — the foreign-visitor funnel (invisible in all 36 ideas, yet the best per-visitor affiliate economics): English-first 21-item starter template, "2 weeks, which islands?" quiz variant, item pages tuned for "Philippines itinerary" queries, routed to high-EPC partners (GetYourGuide/Klook/Agoda). Distribution: r/Philippines and r/travel answer-posts (Reddit ≈40% of LLM citations), English TikTok, and the WSL/FIBA broadcast moments that deliver pre-aggregated foreign attention. Tailwinds: US is now the #1 source market (OFW/Fil-Am angle), China 14-day visa-free, India visa-on-arrival.
- **EPC-aware routing** — foreign visitors convert on GetYourGuide/Klook; Filipinos on 12Go/Agoda peso deals. Segment the hand-off per surface. Plus a `/media-kit` page — press was data-drops-only in every idea.

## 5. Second string (ship only under their stated conditions)

| Idea | Condition |
|---|---|
| Milestone Moments (item #50/#100, region complete → celebration + card) | A handful of genuinely well-designed cards, or skip — Duolingo's 5–10x share lift came from *premium* design; mediocre templates are a no-op. |
| Emoji archipelago grid (text-pasteable, Wordle-style) | Cheap companion export on quiz results — not a flagship; the reply loop only closes because the Quiz exists. Test 17-square legibility in Messenger dark mode. |
| Proof of Done (per-item UGC photo galleries) | Moat, not megaphone. Scoped to the 17 guides, reject-by-default moderation, budgeted as trust infrastructure (the anti-AI-slop asset — 10.7% of TripAdvisor reviews are likely AI). |
| GC Starter Pack (FB mega-group co-branded lists) | Relationship BD with silent failure modes; attempt 2–3 flagship groups, plan **zero** of 2027's growth on it — one clumsy move burns the best channel in the market. |
| Rarity Rank ("only 3% have done this") | Only after ~6 months of real event data. Editorially-invented tiers presented as statistics = fiction on a trust-moat brand. |
| Kreator Scoreboard (`/@handle` creator pages) | Pilot with 3 creators only after the metric means something; the incentive design is unsolved until "127/879" confers clout. |
| Piso-Sale Siren / In Season Now / Where It's NOT Raining / Uwian homecoming kit / event drafting | All real — as newsletter cadence, homepage rails, and editorial calendar. **None count toward the viral portfolio.** The "In Season" affiliate targeting is surgical; the dry-side map needs a hard PAGASA hold rule (an "it's dry here!" carousel circulating during a landfall is the reputational tail risk). |
| Itinerary Drop Kit (planner → TikTok carousel export) | Park until the AI planner expands the destination space past 17; creators post *their own* receipts, not ours. |

## 6. Explicitly not doing (the kill list — keep it killed)

- **Public leaderboards / Province Pride League** — honor-system check-offs + status = the top of every board is fiction; fiction at the top of a scoreboard poisons the editorial credibility the business runs on. Revisit only when location-verified stamps (Sticker Trail) can gate a verified tier.
- **Embeddable third-party widget** — technically broken: browsers partition third-party iframe storage, so the "continue your list on tarabucket.com" funnel silently fails for most visitors.
- **Festival team-picker gimmicks** — nobody flexes a picker-widget result; people flex *being at Sinulog*. The festival content itself is ordinary editorial that ships anyway.
- Also inherited from `PLAN.md` §6: no booking, no payments, no chatbot-for-its-own-sake, no global expansion. And per the "been" lesson: **the count is free, forever.**

## 7. The 2027 moment calendar

| When | Moment | We ship |
|---|---|---|
| **Aug–Oct 2026** | Malacañang signs the 2027 holiday proclamation | **Bridge Hunter launches same-day** (build now) |
| Q4 2026 | — | Spine phase 0–1: Save My List, 879 Pages, event log, Quiz. Least-Visited Province series starts. Build Hit List. |
| **Jan 1–15** | Resolution window | **2027 Hit List drop** + Province Rankings report (press push, ×82 local-paper angles) |
| **Jan 17** | Sinulog + Ati-Atihan, same day; WSL Longboard La Union | Festival editorial + event-week affiliate windows (day-job content, not viral slots) |
| Feb | TravelTour Expo (biggest in PH) | Sticker Trail launch + stickers at the booth-adjacent venues |
| Mar–May | Holy Week + summer domestic peak | **Scratch-Map ships pre-Holy-Week; Barkada Board ships into peak planning season** |
| Jul 10–18 | FIBA Women's Asia Cup, Cebu (LA 2028 stakes) | First-Timer's 21 + Cebu side-trip surfaces; first **Tara Index** quarterly |
| Jul–Nov | Typhoon season; DOT "weather-resilient" push | Dry-side editorial franchise + In Season rails (retention, not virality) |
| ~Oct 31–Nov 10 | **WSL Championship Tour, Cloud 9 Siargao** | Siargao takeover: guides, First-Timer funnel, creator moment |
| Oct | MassKara; **Wrapped build month** | Build Wrapped + fresh card system; November behavior-shaping window ("one more trip before your Wrapped") |
| Early Dec | **PH Travel Wrapped drop** (fixed date, teaser week before) | The year's flagship moment + aggregate "Year in Philippine Travel" data report for press |
| Dec | OFW homecoming peak; SEA Plus Youth Games | Uwian "14 days home" regional templates; homecoming Wrapped angle ("scratched from Dubai") |

## 8. Measurement (build the scoreboard before the mechanics)

The critic's bluntest finding: not one of 36 ideas defined instrumentation. Before any share object ships:

- **Ref codes stamped into every share object at generation time** — per surface, per template variant (text-native objects are the ones that lose attribution).
- **The one funnel that matters:** share → visit → list-created → 30-day return. Per-mechanic **K-factor** = invites-per-user × conversion; a mechanic is *viral* at K>0.5 sustained, *working* at K>0.2, **killed** below 0.1 after two iterations. Weekly review.
- **Affiliate CTR + EPC per placement** (quiz exit, gray province, barkada unchecked items, bridge suggestions, Wrapped starter list) — this is what funds 2028.
- **North stars for 2027:** monthly lists-created; % of new lists originating from a share object (target: >40% by Q4); email-captured lists (Save My List) as the churn-proof base; one measured K>1 moment (Hit List or Wrapped).
- PostHog is already on the roadmap — this is its job description.

## 9. Failure modes (named so they can be watched)

1. **The portfolio flop:** twelve mechanics at 60% polish instead of three at 100%. The spine *is* the priority list; everything in §5 waits.
2. **The lost list:** localStorage wiped by a Messenger webview = a churned evangelist telling the GC we ate his progress. Save My List is phase 0 for this reason.
3. **The trust leak:** invented rarity stats, gamed leaderboards, affiliate links that outrank editorial judgment, an unsafe "Legendary" chase with zero safety framing on difficulty-rated items. Every mechanic inherits `PLAN.md`'s rule: commission never decides ranking — and status never attaches to unverifiable claims.
4. **Platform throttle:** the whole distribution thesis leans on Meta surfaces where links get compressed and groups ban self-promo. The hedge is the owned channel (email) and the citable dataset — both phase 0.
5. **The December miss:** Wrapped built in November by a tired 3-person team, on thin data, with last year's card design. October build, Hit List fallback, fresh visuals — mandatory, not optional.

---

## 10. Implementation status — first pass shipped (2026-07-28)

Three of the spine's mechanics are in the repo and building. Scoped deliberately: §9's first
failure mode is twelve mechanics at 60% polish, so this is the smallest set where the loop
actually closes end to end.

| Shipped | Route | What's real | What's deferred |
|---|---|---|---|
| **The 879 Quiz** (activation keystone) | `/quiz` | 60 icons drawn from the live catalog, **round-robin across regions** so the deck can't skew to Manila/Palawan — verified: all 17 regions present, max 5 from any one. Weekly seeded edition so two friends comparing scores this week see the same deck. Ticking writes to the real localStorage list, so finishing leaves a started bucket list, not a disposable score. Traveler archetype + region breakdown + OS share sheet. | No percentile ("top 18%") — that needs months of real check-off data, and inventing it is the trust failure §9.3 names. |
| **Bridge Hunter** (time-critical) | `/long-weekends` | Full 2027 PH holiday calendar with the **`law` / `movable` / `customary` distinction surfaced in the UI** — the tool says which dates are fixed by RA 9492 and which await the Malacañang proclamation. Leave-day optimizer (0–5 days), 13 bridges at the default 2 days, each matched to in-season destinations from the planner corpus. FAQ + breadcrumb schema. | Eid'l Fitr/Adha omitted on purpose — lunar, proclaimed after moon sighting; a confident wrong date costs more than an absent one. |
| **Save My List** (anti-flop) | `/profile` → `/restore` | Whole list encoded into one URL-safe link. No account, no server, nothing sent to us. Restore **merges** rather than replaces, and on conflict keeps the earlier date. Token decoded client-side so the list stays out of server logs and referrers. | The email half still needs an ESP. The link works today without one. |
| Share attribution | `lib/share.ts` | Every share object stamped with a `ref` code at generation time, per §8. Native share sheet (the only path that reaches Messenger from a phone) with clipboard fallback. | PostHog funnels still to wire. |

Also: `/quiz` and `/long-weekends` get generated OG cards, are in the sitemap and `llms.txt`,
and the quiz took the lead homepage CTA and the first nav slot — a question converts a
first-time visitor better than an instruction.

Guarded by `npm run check` (`src/lib/viral.check.ts`): the 2027 calendar verified against real
weekdays, invariants that no bridge ever tells someone to file leave on a weekend or a
holiday, list-transfer round-trips including non-ASCII titles and malformed tokens, merge
never deleting local progress, and a tie never being reported as a personality.

**Not built yet, in spine order:** the 879 programmatic item pages and the anonymous
check-off event log (both need a schema change against a live database — deliberately not run
unattended), then Scratch-Map, Barkada Board, and the January/December drops.

---

*First implementation decision when resuming: the event log, because Rarity Rank, the Tara Index, and Wrapped aggregates are all fiction without months of real data behind them — every week it isn't logging is a week of history that can't be recovered.*
