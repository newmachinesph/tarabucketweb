<p align="center">
  <img src="public/tarabucket-full-logo.png" alt="Tara Bucket" width="160">
</p>

# Tara Bucket — Web

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Postgres + Drizzle](https://img.shields.io/badge/Postgres-Drizzle_ORM-4169E1?logo=postgresql&logoColor=white)

The Philippine bucket-list journal: a Next.js site for travellers planning their
Philippine bucket list. It pairs editorial content (blog posts, destination guides,
community stories, published through a built-in CMS with a WYSIWYG markdown editor)
with no-sign-up tools: a bucket-list quiz, a day-by-day trip planner, a filterable
catalog of Philippine experiences with an OpenStreetMap view, shareable bucket lists,
and a 2027 long-weekend planner.

This site is **content-first** — it does not promote the mobile app.

Related: [`tarabucketapp`](https://github.com/newmachinesph/tarabucketapp) — the
Tara Bucket mobile app, which the brand tokens here were ported from.

## Features

- **Read** — blog with categories, tags, RSS feed (`/feed.xml`), per-post OG images,
  and reader-submitted community stories.
- **Explore** — the Philippine experiences catalog, filterable by category, type,
  region, cost, duration and difficulty, with a Leaflet/OpenStreetMap map (`/map`).
- **Destinations** — field guides grouped Luzon to Mindanao, with the experiences,
  best months, and how to get there.
- **Plan** — a static trip planner that builds a day-by-day itinerary from a curated
  destination set, with affiliate hand-off links for tours, stays and transport.
- **Bucket lists** — ready-made lists to tick off, or build your own; share as an
  image, back it up and restore it on another device. Progress is stored per device —
  no account needed.
- **Quiz** — "How many have you done?", a 2-minute bucket-list score.
- **Long weekends** — every 2027 Philippine long weekend and the leave days to file
  for each ("bridge hunter").
- **Discoverability** — sitemap, robots, JSON-LD, canonical URLs and `/llms.txt`, all
  built from `NEXT_PUBLIC_SITE_URL`.
- **Admin / CMS** — see below.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19, TypeScript) |
| Styling | Tailwind v4 (brand tokens ported from the mobile app) |
| Database | **Neon** serverless PostgreSQL via **Drizzle ORM** + `node-postgres` (Docker Postgres optional for offline dev) |
| Auth | credentials + `iron-session` (encrypted cookie) + bcrypt |
| Editor | **MDXEditor** — true WYSIWYG markdown |
| Rendering | `react-markdown` + `remark-gfm` (HTML escaped → XSS-safe) |
| Search | Fuse.js (client-side fuzzy) |
| Maps | Leaflet + `react-leaflet`, OpenStreetMap tiles |
| Validation | Zod |

## Prerequisites

- Node 20.12+ (tested on 24)
- A Neon database URL (or Docker, for an offline local Postgres)

## Quick start

```bash
npm install              # deps
cp .env.example .env     # set DATABASE_URL + SESSION_SECRET

npm run db:push          # create tables from the Drizzle schema
npm run db:seed          # seed 1 admin + 10 sample articles + demo rows
npm run db:seed:catalog  # seed the 879-item Philippine experiences catalog

npm run dev              # http://localhost:3000
```

> `db:push`, `db:seed` and `db:seed:catalog` all target whatever `DATABASE_URL`
> points at. It points at Neon — `db:seed` **deletes** existing posts,
> subscribers and story submissions before reseeding. Check the URL before running it.

For an offline local database instead, run `npm run db:up` (Docker Postgres on
host port 5544) and point `DATABASE_URL` at
`postgresql://tarabucket:tarabucket@localhost:5544/tarabucket`.

`db:seed:catalog` reads `../all-bucket-list/data/bucket-list.json` from a sibling
`all-bucket-list` checkout next to this one. That dataset is not part of this
repository, so without it the catalog-driven pages (explore, map, collections,
experience pages, quiz) have no items to show.

## Admin / CMS

- URL: **http://localhost:3000/admin**
- Seeded login: whatever `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` are set to in
  `.env` at the time you run `db:seed` — **change the password after first login**

From the admin you can:
- Write/edit posts in a WYSIWYG markdown editor; set cover, category, tags,
  feature on homepage; save as draft or publish.
- Review reader-submitted stories and publish the best to the public Stories page.
- View and manage newsletter subscribers.

## Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | iron-session cookie key — **required**, min 32 chars; the app refuses to boot without it |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | one-time admin seed |
| `NEXT_PUBLIC_SITE_URL` | canonical site URL (metadata, sitemap, feeds) — set the real domain in prod, else links point at localhost |
| `NEXT_PUBLIC_AFFILIATE_ID` | optional affiliate attribution ID for partner links (placeholder until programs approve) |
| `DB_POOL_MAX` | optional Postgres pool size per instance (default 5) |

`.env` is gitignored; `.env.example` is the template.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `start` | production build / serve |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run check` | assertion self-checks for the destination and long-weekend/quiz logic (`tsx`, no test runner) |
| `npm run db:up` / `db:down` | start / stop Docker Postgres |
| `npm run db:push` | sync schema to the DB (dev) |
| `npm run db:seed` | seed admin + sample content (**destructive** — clears posts/subscribers/submissions first) |
| `npm run db:seed:catalog` | upsert the 879-item experiences catalog (non-destructive) |
| `npm run db:geocode` | geocode catalog locations into `src/db/geocode-cache.json` for the map |
| `npm run db:studio` | Drizzle Studio (browse data) |

## Project structure

```
src/
  app/
    (site)/            public pages: home, blog, category, tag, stories, about, search,
                       explore (+ region), map, destinations, experience, collections,
                       bucket-list (+ new), plan, quiz, long-weekends, profile, restore
    admin/             CMS: login + (dashboard) posts CRUD, submissions, subscribers
    api/               catalog autosuggest, newsletter, story-submission route handlers
    feed.xml/ llms.txt/ sitemap.ts robots.ts manifest.ts opengraph-image.tsx
  components/          UI, header/footer, editor (MDXEditor), admin, map, planner,
                       bucket lists, quiz, profile
  db/                  Drizzle schema, client, seeds, catalog geocoder + cache
  lib/                 auth, session, posts data layer, catalog, destinations, planner,
                       holidays, affiliates, validation, *.check.ts self-checks
  proxy.ts             admin route guard (Next 16 "proxy", formerly middleware)
```

## Production notes

- **Database:** running on Neon. Schema is applied with `npm run db:push`
  (schema-push workflow — there is no `drizzle/` migrations folder). Neon pools
  connections at the `-pooler` host, and TLS comes from `?sslmode=require` in the URL.
- **Session:** set a strong random `SESSION_SECRET`
  (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
  Rotating it invalidates every signed-in admin session.
- Cookies are `secure` automatically in production (`NODE_ENV=production`).
- Set `NEXT_PUBLIC_SITE_URL` to the real domain — it is inlined at build time, so
  changing it later needs a rebuild.
- Set every env var in the host's dashboard (Vercel etc.); `.env` is gitignored and
  is not deployed.
- Newsletter + story submissions are stored in the DB now; wire an email
  provider (Resend/Mailchimp) later by extending the API routes.

## License

[MIT](LICENSE) © 2026 Tara Bucket. MIT covers the code; the Tara Bucket name and
logo identify the project.
