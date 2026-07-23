# Tara Bucket — Web

The Philippine bucket-list journal. A content + engagement site (blogs, guides,
community stories) with a built-in CMS so a non-technical editor can log in and
publish using a WYSIWYG markdown editor.

This site is **content-first** — it does not promote the mobile app.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19, TypeScript) |
| Styling | Tailwind v4 (brand tokens ported from the mobile app) |
| Database | PostgreSQL (Docker) via **Drizzle ORM** + `node-postgres` |
| Auth | credentials + `iron-session` (encrypted cookie) + bcrypt |
| Editor | **MDXEditor** — true WYSIWYG markdown |
| Rendering | `react-markdown` + `remark-gfm` (HTML escaped → XSS-safe) |
| Search | Fuse.js (client-side fuzzy) |

## Prerequisites

- Node 20.12+ (tested on 24)
- Docker (for local Postgres)

## Quick start

```bash
npm install             # deps
cp .env.example .env     # then edit if needed (defaults work locally)

npm run db:up           # start Postgres in Docker (host port 5544)
npm run db:push         # create tables from the Drizzle schema
npm run db:seed         # seed 1 admin + 6 sample articles

npm run dev             # http://localhost:3000
```

## Admin / CMS

- URL: **http://localhost:3000/admin**
- Seeded login (from `.env`):
  - email: `admin@tarabucket.ph`
  - password: `tarabucket123`  ← **change this after first login**

From the admin you can:
- Write/edit posts in a WYSIWYG markdown editor; set cover, category, tags,
  feature on homepage; save as draft or publish.
- Review reader-submitted stories and publish the best to the public Stories page.
- View and manage newsletter subscribers.

## Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | iron-session cookie key (min 32 chars) — **set a strong value in prod** |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | one-time admin seed |
| `NEXT_PUBLIC_SITE_URL` | canonical site URL (metadata) — optional |

`.env` is gitignored; `.env.example` is the template.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `start` | production build / serve |
| `npm run db:up` / `db:down` | start / stop Docker Postgres |
| `npm run db:push` | sync schema to the DB (dev) |
| `npm run db:seed` | seed admin + sample content |
| `npm run db:studio` | Drizzle Studio (browse data) |

## Project structure

```
src/
  app/
    (site)/            public pages: home, blog, [slug], category, tag, stories, about, search
    admin/             CMS: login + (dashboard) posts CRUD, submissions, subscribers
    api/               newsletter + story-submission route handlers
  components/          UI, header/footer, post card, editor (MDXEditor), admin
  db/                  Drizzle schema, client, seed
  lib/                 auth, session, posts data layer, categories, validation
  proxy.ts             admin route guard (Next 16 "proxy", formerly middleware)
```

## Production notes

- **Database:** point `DATABASE_URL` at a managed Postgres (Neon, Supabase, RDS,
  Railway). Run `npm run db:push` (or generate migrations with `drizzle-kit`)
  against it. No code change needed.
- **Session:** set a strong random `SESSION_SECRET`
  (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- Cookies are `secure` automatically in production (`NODE_ENV=production`).
- Newsletter + story submissions are stored in the DB now; wire an email
  provider (Resend/Mailchimp) later by extending the API routes.
