import "server-only";
import { and, desc, eq, ne, or, sql, arrayContains } from "drizzle-orm";
import readingTime from "reading-time";
import slugify from "slugify";
import { db } from "@/db";
import { posts, users, type Post } from "@/db/schema";
import type { PostInput } from "./validation";

export type PostWithAuthor = Post & { authorName: string | null };

const publishedOnly = and(eq(posts.status, "published"), sql`${posts.publishedAt} is not null`);

function withAuthor() {
  return db
    .select({
      post: posts,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id));
}

function flatten(rows: { post: Post; authorName: string | null }[]): PostWithAuthor[] {
  return rows.map((r) => ({ ...r.post, authorName: r.authorName }));
}

export async function getPublishedPosts(opts?: {
  category?: string;
  tag?: string;
  limit?: number;
}): Promise<PostWithAuthor[]> {
  const filters = [publishedOnly];
  if (opts?.category) filters.push(eq(posts.category, opts.category));
  if (opts?.tag) filters.push(arrayContains(posts.tags, [opts.tag]));

  const q = withAuthor()
    .where(and(...filters))
    .orderBy(desc(posts.publishedAt));

  const rows = opts?.limit ? await q.limit(opts.limit) : await q;
  return flatten(rows);
}

export async function getFeaturedPosts(limit = 3): Promise<PostWithAuthor[]> {
  const rows = await withAuthor()
    .where(and(publishedOnly, eq(posts.featured, true)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  const featured = flatten(rows);
  if (featured.length >= limit) return featured;
  // Backfill with latest if not enough featured posts.
  const latest = await getPublishedPosts({ limit: limit + featured.length });
  const seen = new Set(featured.map((p) => p.id));
  for (const p of latest) {
    if (featured.length >= limit) break;
    if (!seen.has(p.id)) featured.push(p);
  }
  return featured;
}

export async function getPostBySlug(slug: string): Promise<PostWithAuthor | null> {
  const [row] = await withAuthor().where(eq(posts.slug, slug)).limit(1);
  if (!row || row.post.status !== "published") return null;
  return { ...row.post, authorName: row.authorName };
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<PostWithAuthor[]> {
  const rows = await withAuthor()
    .where(and(publishedOnly, eq(posts.category, post.category), ne(posts.id, post.id)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  return flatten(rows);
}

/** Posts matching any of the given tags (for cross-linking destinations to the journal). */
export async function getPostsByTags(
  tags: string[],
  limit = 3,
  excludeSlug?: string,
): Promise<PostWithAuthor[]> {
  if (tags.length === 0) return [];
  const rows = await withAuthor()
    .where(and(publishedOnly, or(...tags.map((t) => arrayContains(posts.tags, [t])))))
    .orderBy(desc(posts.publishedAt))
    .limit(limit + 1);
  const out = flatten(rows).filter((p) => p.slug !== excludeSlug);
  return out.slice(0, limit);
}

export type SearchDoc = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
};

export async function getSearchIndex(): Promise<SearchDoc[]> {
  const rows = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      category: posts.category,
      tags: posts.tags,
    })
    .from(posts)
    .where(publishedOnly)
    .orderBy(desc(posts.publishedAt));
  return rows;
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const rows = await db
    .select({ tags: posts.tags })
    .from(posts)
    .where(publishedOnly);
  const counts = new Map<string, number>();
  for (const r of rows) for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ category: posts.category, count: sql<number>`count(*)::int` })
    .from(posts)
    .where(publishedOnly)
    .groupBy(posts.category);
  return Object.fromEntries(rows.map((r) => [r.category, r.count]));
}

// ── Admin operations (callers must enforce auth) ──────────────────

export async function getAllPostsAdmin(): Promise<PostWithAuthor[]> {
  const rows = await withAuthor().orderBy(desc(posts.updatedAt));
  return flatten(rows);
}

export async function getPostById(id: string): Promise<Post | null> {
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return row ?? null;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base, { lower: true, strict: true }) || "post";
  let candidate = root;
  let n = 2;
  while (true) {
    const [clash] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, candidate))
      .limit(1);
    if (!clash || clash.id === excludeId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

function computeFields(input: PostInput) {
  return {
    readingMinutes: Math.max(1, Math.ceil(readingTime(input.content || "").minutes)),
    coverImage: input.coverImage ? input.coverImage : null,
  };
}

export async function createPost(input: PostInput, authorId: string): Promise<Post> {
  const slug = await uniqueSlug(input.slug || input.title);
  const extra = computeFields(input);
  const [row] = await db
    .insert(posts)
    .values({
      slug,
      title: input.title,
      excerpt: input.excerpt ?? "",
      content: input.content ?? "",
      coverImage: extra.coverImage,
      category: input.category,
      tags: input.tags ?? [],
      status: input.status,
      featured: input.featured,
      readingMinutes: extra.readingMinutes,
      authorId,
      publishedAt: input.status === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .returning();
  return row;
}

export async function updatePost(id: string, input: PostInput): Promise<Post | null> {
  const current = await getPostById(id);
  if (!current) return null;
  const slug = input.slug
    ? await uniqueSlug(input.slug, id)
    : current.slug;
  const extra = computeFields(input);
  const becomingPublished = input.status === "published" && current.status !== "published";
  const [row] = await db
    .update(posts)
    .set({
      slug,
      title: input.title,
      excerpt: input.excerpt ?? "",
      content: input.content ?? "",
      coverImage: extra.coverImage,
      category: input.category,
      tags: input.tags ?? [],
      status: input.status,
      featured: input.featured,
      readingMinutes: extra.readingMinutes,
      publishedAt: becomingPublished ? new Date() : current.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();
  return row ?? null;
}

export async function deletePost(id: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id));
}
