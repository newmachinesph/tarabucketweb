import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { CATEGORIES } from "@/lib/categories";
import { DESTINATIONS } from "@/lib/destinations";
import { BUCKET_TEMPLATES } from "@/lib/bucket-templates";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const posts = await getPublishedPosts();

  // /profile is deliberately absent — it renders per-device progress and is noindex.
  const staticPaths: [string, number][] = [
    ["", 1],
    ["/plan", 0.9],
    ["/blog", 0.8],
    ["/explore", 0.8],
    ["/map", 0.8],
    ["/collections", 0.7],
    ["/destinations", 0.8],
    ["/bucket-list", 0.7],
    ["/bucket-list/new", 0.4],
    ["/stories", 0.6],
    ["/about", 0.5],
    ["/partners", 0.4],
  ];

  return [
    ...staticPaths.map(([p, priority]) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...CATEGORIES.map((c) => ({
      url: `${base}/category/${c.key}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...DESTINATIONS.map((d) => ({
      url: `${base}/destinations/${d.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...BUCKET_TEMPLATES.map((t) => ({
      url: `${base}/bucket-list/${t.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
