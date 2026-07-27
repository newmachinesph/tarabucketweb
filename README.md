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
| Database | **Neon** serverless PostgreSQL via **Drizzle ORM** + `node-postgres` (Docker Postgres optional for offline dev) |
| Auth | credentials + `iron-session` (encrypted cookie) + bcrypt |
| Editor | **MDXEditor** — true WYSIWYG markdown |
| Rendering | `react-markdown` + `remark-gfm` (HTML escaped → XSS-safe) |
| Search | Fuse.js (client-side fuzzy) |

## Prerequisites

- Node 20.12+ (tested on 24)
- A Neon database URL (or Docker, for an offline local Postgres)

## Quick start

```bash
npm install              # deps
cp .env.example .env     # set DATABASE_URL + SESSION_SECRET

npm run db:push          # create tables from the Drizzle schema
npm run db:seed          # seed 1 admin + 6 sample articles
npm run db:seed:catalog  # seed the 879-item Philippine experiences catalog

npm run dev              # http://localhost:3000
```

> `db:push`, `db:seed` and `db:seed:catalog` all target whatever `DATABASE_URL`
> points at. It points at Neon — `db:seed` **deletes** existing posts,
> subscribers and story submissions before reseeding. Check the URL before running it.

For an offline local database instead, run `npm run db:up` (Docker Postgres on
host port 5544) and point `DATABASE_URL` at
`postgresql://tarabucket:tarabucket@localhost:5544/tarabucket`.

`db:seed:catalog` reads `../all-bucket-list/data/bucket-list.json` from the
sibling repo, which must be checked out next to this one.

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

`.env` is gitignored; `.env.example` is the template.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `start` | production build / serve |
| `npm run db:up` / `db:down` | start / stop Docker Postgres |
| `npm run db:push` | sync schema to the DB (dev) |
| `npm run db:seed` | seed admin + sample content (**destructive** — clears posts/subscribers/submissions first) |
| `npm run db:seed:catalog` | upsert the 879-item experiences catalog (non-destructive) |
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
