# Tara Bucket — Full Audit, Feature Ideas & Recommendations

_Reviewed: 2026-07-23 · Next.js 16.2.10 · React 19 · Drizzle ORM + Postgres · iron-session_

Findings are grouped by severity with exact `file:line` locations and concrete fixes. A
feature roadmap and a prioritized action list follow at the end.

> **Update — fixes applied.** The findings below have since been implemented (see
> _Resolution status_). The report is kept as the rationale/paper-trail.

## ✅ Resolution status

All Critical/High/Medium and most Low findings were fixed, verified with a green
production build plus runtime tests (security headers, rate-limit → 429, honeypot,
correct 404s, and an end-to-end admin/editor role test via a headless browser).

**Fixed**
- **C1** seed requires `SEED_ADMIN_PASSWORD` (no hardcoded fallback).
- **H1** real RBAC: `requireUser`/`requireAdmin`/`canManagePost`; admin-only pages and
  destructive actions gated; verified an editor is blocked from `/admin/subscribers`.
- **H2** post edit/delete now enforce author-or-admin ownership.
- **H3** in-memory rate limiting + honeypot on both public POST endpoints (verified 429).
- **H4** `force-dynamic` removed from public pages → ISR (`revalidate`), so the
  `revalidatePath` calls in actions are now effective; admin stays dynamic.
- **M1** `SESSION_SECRET` validated at boot in production (length + placeholder check).
- **M3** hot readers (`getPostBySlug`, `getCatalogItem`, `catalogFacets`) memoized with
  `React.cache`; `regionBySlug` now rides that cache.
- **M4** DB pool default lowered to 5 (`DB_POOL_MAX`).
- **M5** default OG image, Twitter cards added to root metadata.
- **M7** contrast fix (`--color-faint`), informative `alt` text, LCP `fetchPriority`.
- **M8** search index capped (500).
- **L1–L3** mobile-menu `aria-controls`/Escape, skip-to-content link, `aria-live` form status.
- **L4** deleted the unused three.js hero and dropped `three`/`@react-three/*` (~600 KB).
- **L5** trimmed Playfair to the 3 used weights.
- **L6** catalog enum filters whitelisted.
- **L8** dropped `robots.host`; `/search` de-indexed; `/explore` + `/collections` in sitemap.
- **L9** GIN indexes on tag arrays + `story_submissions.status` (apply via `db:push`).
- **Config** `next` → 16.2.11 (clears the Next.js app-level CVEs), `poweredByHeader:false`,
  security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS), `images.remotePatterns` for Unsplash.
- Added `error.tsx` / `not-found.tsx` (branded) / `global-error.tsx` boundaries (**M2**).

**Deliberately deferred (with rationale)**
- **M2 loading skeletons** — a group-level `loading.tsx` turned every `notFound()` into a
  soft-404 (HTTP 200) by putting a Suspense boundary above detail pages. Since pages are
  now ISR-cached (fast), correct 404 status codes won out; the skeleton was removed.
- **M6 full `next/image` migration** — post covers are editor-supplied arbitrary URLs and
  `next/image` throws for non-allowlisted hosts, so a blanket conversion would crash on any
  non-Unsplash cover. `remotePatterns` + loading hints were added instead; a cover-host
  policy is needed before completing the migration.
  **✅ Closed 2026-07-28.** The deferral assumed an all-or-nothing migration. Decided
  per-image instead: `components/cover-image.tsx` checks the URL's hostname against
  `lib/image-hosts.ts` and renders `next/image` when it can, a plain `<img>` when it can't —
  so allowlisted covers get AVIF/WebP + `srcset` + reserved space, and an editor pasting any
  other host degrades instead of crashing the page. **No cover-host policy needed.**
  `next.config.ts` now derives `remotePatterns` from that same list, so config and runtime
  guard can't drift. Every raw `<img>` on a public page is gone (repo-owned images use
  `next/image` directly with `priority` on each LCP element); only the admin post-form
  preview stays raw, deliberately — it previews a URL mid-typing. Guarded by `npm run check`,
  including a `images.unsplash.com.evil.com` case that a `startsWith` check would have let
  through.
- **Transitive deps** (`js-yaml` via the admin-only MDX editor, `postcss`/`sharp` via next,
  `esbuild` via drizzle-kit dev tooling) — no clean fix without breaking-change forces;
  low real-world exposure. Track upstream.

---

## Health snapshot

| Check | Result |
|---|---|
| Production build (`npm run build`) | ✅ Passes clean (all 30 routes compile) |
| TypeScript strict | ✅ No errors (after a clean dep install) |
| `npm audit` | ⚠️ 9 vulns (5 high, 4 moderate) — see §Dependencies |
| SQL injection | ✅ Clean — everything parameterized via Drizzle |
| XSS | ✅ Well-defended — `react-markdown` without `rehype-raw`, JSON-LD escaped |
| Auth (authentication) | ✅ Solid — sealed cookie, timing-safe compare, defense-in-depth |
| Auth (authorization/roles) | ❌ Role column exists but is never enforced |

The overall engineering quality is high: clean data layer, correct Next 16 idioms
(async `params`/`searchParams`, `proxy.ts`, server actions), thoughtful XSS/redirect
defenses. The issues below are real but mostly localized.

---

## 🔴 Critical

### C1 — Hardcoded default admin password in the seeder
`src/db/seed.ts:178` — `const password = process.env.SEED_ADMIN_PASSWORD ?? 'tarabucket123';`

If `SEED_ADMIN_PASSWORD` is unset, the first admin is created with the publicly-known
password `tarabucket123` (it's in the README). The fallback doesn't even match
`.env.example` (`change_me`), so an operator who copies the example still won't override
it. With `/admin/login` reachable, this is account takeover.

**Fix:** throw when `SEED_ADMIN_PASSWORD` is unset instead of falling back. Never ship a
real default password.

---

## 🟠 High

### H1 — `admin` vs `editor` role is never enforced (broken access control)
`src/lib/auth.ts:27` (`requireAdmin`), `src/app/admin/actions.ts:60,80,89,103`

`users.role` (`schema.ts:9`) is written into the session at login (`actions.ts:42`) and
echoed back (`auth.ts:22`), but **no code ever reads it for an authorization decision**
(grep-confirmed: only a write and a passthrough). `requireAdmin` is a misnomer — it only
checks authentication. Every mutating action (`savePost`, `deletePostAction`,
`setSubmissionStatus`, `deleteSubscriber`) gates on `user?.userId` alone, so any `editor`
can do everything an admin can.

**Fix:** add a real `requireRole('admin')` and apply it to destructive actions — or drop
the `role` column if the distinction isn't intended. Don't leave a security control that
looks enforced but isn't.

### H2 — No ownership check on post edit/delete
`src/lib/posts.ts:192` (`updatePost`), `:221` (`deletePost`); callers `actions.ts:68,79`

Any authenticated editor can edit or delete any other author's post by ID; `authorId` is
never compared to the session user.

**Fix:** for non-admins, scope the `where` to
`and(eq(posts.id, id), eq(posts.authorId, user.userId))`.

### H3 — Public POST endpoints have no rate limiting / anti-abuse
`src/app/api/newsletter/route.ts:6`, `src/app/api/stories/route.ts:6`

Both are unauthenticated with no rate limit, CAPTCHA, or origin check. `stories` accepts
6 000 chars/submission and inserts unconditionally → trivial DB flooding and spam.

**Fix:** per-IP rate limiting (e.g. `@upstash/ratelimit` + Redis, or a lightweight
in-memory token bucket), a honeypot field or CAPTCHA on the story form, and an origin
check.

### H4 — Blanket `force-dynamic` defeats the app's own caching (perf + SEO)
22 occurrences across `src/app`, e.g. `(site)/page.tsx:21`, `blog/page.tsx:8`,
`blog/[slug]/page.tsx:13`, `category/[key]/page.tsx:9`, `explore/page.tsx:15`,
`feed.xml/route.ts`, `sitemap.ts`

Every public page opts out of static generation and CDN caching — yet the server actions
invest heavily in `revalidatePath()` (`actions.ts:18-23,74-75,83,97-98`). Because nothing
is cached, **every `revalidatePath` call is a dead no-op.** The app pays full dynamic
render cost on every request _and_ carries useless revalidation plumbing. For a
content-first blog whose data changes infrequently, this is the single highest-value fix
(hurts TTFB, LCP, and crawl efficiency).

**Fix:** remove `force-dynamic` from public pages. Wrap DB reads in `unstable_cache(fn,
keys, { tags, revalidate })` (or `export const revalidate = N`), then the existing
`revalidateTag`/`revalidatePath` calls become meaningful. Reserve dynamic rendering for
`/admin/*`. (Per Next 16 `caching-without-cache-components.md` — `force-dynamic` is the
escape hatch, not the default.)

---

## 🟡 Medium

### M1 — `SESSION_SECRET` has a weak placeholder and no runtime validation
`.env.example:6` ships `"change_me_min_32_chars_long_random_string"`; `src/lib/session.ts:12`
casts `process.env.SESSION_SECRET as string` with no length/strength check. Deployed
unchanged → all session cookies are sealed with a guessable key → forgeable admin sessions.

**Fix:** assert at boot that `SESSION_SECRET` is present, ≥32 chars, and not the placeholder.

### M2 — No error / loading / not-found boundaries
No `loading.tsx`, `error.tsx`, `not-found.tsx`, or `global-error.tsx` anywhere in `src/app`.
With every page hitting the DB, navigations show a blank wait, an unhandled DB/render error
white-screens the app, and `notFound()` in `blog/[slug]` falls back to the bare Next default.

**Fix:** add `app/(site)/loading.tsx` (skeletons), `error.tsx` (boundary), `not-found.tsx`
(branded 404), and a root `global-error.tsx`.

### M3 — Read functions aren't request-deduped or cached
`src/lib/posts.ts` (whole file) — no `React.cache` or `unstable_cache`. `HomePage` calls
`getFeaturedPosts(1)` which internally backfills via `getPublishedPosts()` (`posts.ts:52`)
_plus_ a direct `getPublishedPosts({limit:6})` — overlapping queries, separate round-trips
in a single render.

**Fix:** wrap readers in `React.cache(...)` for per-request memoization and `unstable_cache`
for cross-request caching (pairs with the H4 fix).

### M4 — Serverless DB pool sizing
`src/db/index.ts:8-12` — `new Pool({ max: 10 })`. In serverless, each warm instance holds
up to 10 Postgres connections; N instances → up to 10·N, risking `max_connections`
exhaustion.

**Fix:** lower `max` to 1–5 for serverless, or front Postgres with a pooler (PgBouncer /
Neon / Supabase pooler).

### M5 — Missing OpenGraph image, Twitter cards, and canonical URLs
`layout.tsx:34-40` and all pages. No default OG image (1200×630), no `twitter:` metadata
site-wide, no `alternates.canonical`. `/explore` generates many indexable filter-permutation
URLs (`?category=…&cost=…`) that are duplicate content.

**Fix:** add a default `openGraph.images` + `twitter: { card: "summary_large_image" }` in
root metadata, and `alternates.canonical` per page (canonicalize `/explore` to its base URL).

### M6 — Raw `<img>` for all content images (CLS + no optimization)
`page.tsx:101,139,211,271`, `blog/[slug]/page.tsx:65`, `post-card.tsx:23`,
`destinations/[slug]/page.tsx:37,75,153` — all raw `<img>` with the ESLint
`no-img-element` rule suppressed inline, no `width`/`height` (layout shift), no responsive
`srcset`/AVIF/WebP, no blur placeholder. Only the logo uses `next/image`.

**Fix:** add `images.remotePatterns` for `images.unsplash.com` in `next.config.ts` and
migrate to `next/image` (the aspect-ratio wrappers already in place make `fill` easy).

### M7 — Accessibility: image `alt` text and color contrast
- **Empty alt on meaningful images:** `page.tsx:140-145,211-215,272-276`,
  `blog/[slug]/page.tsx:66-70` use `alt=""` on informative covers → screen-reader users get
  nothing. Give real `alt` (e.g. `alt={post.title}`); keep `alt=""` only for decorative art.
- **Contrast failures (WCAG AA):** `--color-faint` `#9aa7b4` on white ≈ 2.0:1 (meta,
  figcaptions, facet counts); category labels use full-saturation brand colors on white
  (green ≈ 1.9:1, blue ≈ 2.6:1). Darken `--color-faint` to ~`#6b7885` and use `-dark`
  category tones for small text.

### M8 — In-JS aggregation over unbounded scans
- `getAllTags` (`posts.ts:113-123`) loads every published post's tags into Node and counts
  in a `Map` — should be SQL `unnest(tags) … group by` with a GIN index on `posts.tags`.
- `regionBySlug` (`catalog.ts:140-144`) runs two full-table GROUP-BY aggregates on every
  region/destination request just to map a slug → region name.
- `getSearchIndex` (`posts.ts:98`) ships **all** published posts to the client for Fuse.js
  with no limit.

**Fix:** push aggregation into Postgres; cap/paginate the search index or move search
server-side.

---

## 🟢 Low / polish

- **L1** Mobile menu (`site-header.tsx:60-88`) lacks `aria-controls`, Escape-to-close, focus
  trap/return, and doesn't close on route change.
- **L2** No skip-to-content link; `<main>` has no `id` (`(site)/layout.tsx:14`).
- **L3** Newsletter status messages aren't announced (`newsletter-form.tsx` — add
  `role="status"`/`aria-live`).
- **L4** Dead code: `three/hero-3d.tsx` + `three/hero-scene.tsx` are imported by nothing;
  the homepage hero is a static `<img>`. The `three`, `@react-three/fiber`,
  `@react-three/drei` deps (~600 KB) ship for zero user value. **Either wire the 3D hero in
  or delete the components and drop the deps.**
- **L5** Font payload: Poppins (5 weights) + Playfair Display (6 weights × normal & italic) ≈
  17 files (`layout.tsx:6-20`). Trim to the weights actually used.
- **L6** Catalog filter values from the URL aren't whitelisted (`catalog.ts:22-41`) — safe
  (parameterized) but invalid values silently return empty; validate against the known enums.
- **L7** Pagination offset (`catalog.ts:51`) and category/tag listings (`getPublishedPosts`)
  are unbounded — fine at current scale, add caps before growth.
- **L8** `robots.ts:9` uses the non-standard `host` directive (Google ignores it); `/search`
  is in the sitemap — search pages are usually better left unindexed.
- **L9** Missing indexes for real query patterns: GIN on `catalogItems.tags` / `posts.tags`,
  and `storySubmissions.status` (all acknowledged as fine at current scale).

---

## Dependencies (`npm audit`)

| Package | Severity | Note |
|---|---|---|
| `next` 16.2.10 | High | Multiple advisories (proxy bypass, SSRF in Server Actions, cache confusion, image-optimization DoS). Fixed in **16.2.11** — a patch bump. |
| `sharp` <0.35.0 | High | Inherited libvips CVEs (pulled via next). Resolves with the next bump. |
| `postcss` <8.5.11 | High | XSS / file-read via source maps (pulled via next). |
| `js-yaml` 4.0–4.2 | High | Quadratic-CPU DoS via merge keys, pulled via `@mdxeditor/editor`. No direct fix yet — editor is admin-only, so exposure is limited. |
| `esbuild`/`drizzle-kit` | Moderate | Dev-server request leak; dev-tooling only (not shipped). |

**Fix:** bump `next` to `16.2.11` (clears 3 of the 5 highs at once) and re-audit. Track the
`@mdxeditor`/`js-yaml` advisory; risk is low since the editor is behind admin auth.

---

## 💡 Feature suggestions

Grounded in what's already built (a catalog of 879 Philippine experiences, a CMS, localStorage
bucket lists, newsletter, community stories):

**Engagement & retention**
1. **Server-synced bucket lists with accounts.** Today lists live only in `localStorage`
   (`lib/local-store.ts`) — lost on cache-clear, no cross-device sync. Add lightweight reader
   accounts (magic-link) so users keep their lists, check-offs, and can share a public list URL.
2. **"I did this" check-offs → a progress profile.** Turn catalog items into a personal map:
   items done, regions unlocked, a shareable "X/879 completed" badge (great social loop).
3. **Save/bookmark articles & experiences** for logged-in readers; power a "Continue reading"
   rail on the homepage.

**Content & discovery**
4. **Wire the newsletter to a real ESP** (Resend/Mailchimp) with a double-opt-in confirmation
   email and an automated "new issue" digest — the README already flags this as TODO.
5. **Editorial → catalog linking.** Let posts tag catalog items so an article auto-shows
   "Experiences in this story," and each experience page shows related articles (some of this
   plumbing exists — deepen it).
6. **Itinerary / trip builder.** Group catalog items by region into a shareable multi-day plan
   with cost-band and duration roll-ups (the `costBand`/`duration`/`difficulty` fields are
   already in the schema).
7. **Map view of the catalog** (region/province/place already in the schema) — a browse-by-map
   experience is a natural fit for a bucket-list site.

**Community & CMS**
8. **Reactions / lightweight comments** on published stories to build community.
9. **Scheduled publishing** (`publishedAt` in the future) + a draft-preview link so editors can
   share unpublished drafts.
10. **Admin analytics tile:** top posts, subscriber growth, submission funnel — the data is
    already in Postgres.

**Trust & polish**
11. **Search-as-you-type on the catalog** and saved filter presets on `/explore`.
12. **PWA / offline** for the bucket-list board (it's already localStorage-first — a natural
    offline candidate).

---

## Recommended priority order

**Now (security & correctness)**
1. C1 — remove the hardcoded seed password fallback.
2. H1/H2 — enforce roles + post ownership on mutating actions.
3. H3 — rate-limit the public POST endpoints.
4. M1 — validate `SESSION_SECRET` at boot.
5. Bump `next` → 16.2.11 and re-audit.

**Next (perf, SEO, resilience)**
6. H4 + M3 — drop `force-dynamic`, add `unstable_cache`/`revalidate` + `React.cache`, make the
   `revalidate*` calls real.
7. M2 — add loading/error/not-found boundaries.
8. M5/M6 — OG image + Twitter cards + canonicals; migrate content images to `next/image`.

**Then (a11y, polish, cleanup)**
9. M7 + L1–L3 — alt text, contrast, keyboard/ARIA on the mobile menu, announced form status.
10. L4/L5 — decide the 3D hero's fate; trim fonts.
11. M8 + L9 — push aggregation into SQL, add indexes before content grows.

**Roadmap (features)**
12. Reader accounts + server-synced bucket lists (unlocks features 1–3, 12).
13. Wire the newsletter ESP; deepen editorial↔catalog linking.
