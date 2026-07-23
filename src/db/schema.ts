import { pgTable, uuid, text, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';

// Editors who can log in and manage content.
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('editor'), // 'admin' | 'editor'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Editorial articles / stories. Body is stored as markdown (produced by the WYSIWYG editor).
export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull().default(''),
    content: text('content').notNull().default(''),
    coverImage: text('cover_image'),
    category: text('category').notNull().default('travel'),
    tags: text('tags').array().notNull().default([]),
    status: text('status').notNull().default('draft'), // 'draft' | 'published'
    featured: boolean('featured').notNull().default(false),
    readingMinutes: integer('reading_minutes').notNull().default(1),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('posts_status_idx').on(t.status),
    index('posts_category_idx').on(t.category),
    index('posts_published_idx').on(t.publishedAt),
    // GIN index for tag array-contains queries (getPostsByTags).
    index('posts_tags_idx').using('gin', t.tags),
  ],
);

// Newsletter email captures.
export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Reader-submitted bucket-list stories, reviewed in the admin.
export const storySubmissions = pgTable(
  'story_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    location: text('location').notNull().default(''),
    title: text('title').notNull(),
    story: text('story').notNull(),
    status: text('status').notNull().default('new'), // 'new' | 'published' | 'archived'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('story_status_idx').on(t.status)],
);

// The Philippine experiences catalog — 879 items seeded from all-bucket-list.
// Reference data (read-only from the site's perspective; written only by the seed script),
// so no ownership columns and no RLS concern like the mobile app has.
export const catalogItems = pgTable(
  'catalog_items',
  {
    // The source slug id (e.g. "hop-the-islands-of-el-nido-s-bacuit-bay") — stable and
    // human-readable, so it doubles as the URL segment for item detail pages.
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    verb: text('verb'),
    subject: text('subject'),
    // categoryKey is the site's 6-category taxonomy (lib/categories.ts); sourceCategory
    // keeps the catalog's original 14 so the 14→6 mapping stays auditable and re-derivable.
    categoryKey: text('category_key').notNull().default('travel'),
    sourceCategory: text('source_category'),
    subcategory: text('subcategory'),
    tertiary: text('tertiary'),
    region: text('region'),
    province: text('province'),
    place: text('place'),
    tags: text('tags').array().notNull().default([]),
    description: text('description'),
    costBand: text('cost_band'), // free | budget | mid | splurge | luxury
    duration: text('duration'), // hours | half-day | day | weekend | multi-day
    difficulty: text('difficulty'), // easy | moderate | hard
  },
  (t) => [
    index('catalog_category_idx').on(t.categoryKey),
    index('catalog_region_idx').on(t.region),
    index('catalog_province_idx').on(t.province),
    index('catalog_costband_idx').on(t.costBand),
    // GIN index for tag array-contains queries (listByTag).
    index('catalog_tags_idx').using('gin', t.tags),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type CatalogItem = typeof catalogItems.$inferSelect;
export type NewCatalogItem = typeof catalogItems.$inferInsert;
export type User = typeof users.$inferSelect;
export type StorySubmission = typeof storySubmissions.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
