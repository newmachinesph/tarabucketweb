import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { posts, subscribers, storySubmissions } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [published, drafts, subs, newStories, recent] = await Promise.all([
    db.$count(posts, eq(posts.status, "published")),
    db.$count(posts, eq(posts.status, "draft")),
    db.$count(subscribers),
    db.$count(storySubmissions, eq(storySubmissions.status, "new")),
    db.select().from(posts).orderBy(desc(posts.updatedAt)).limit(5),
  ]);

  const stats = [
    { label: "Published", value: published, href: "/admin/posts", color: "#22C58B" },
    { label: "Drafts", value: drafts, href: "/admin/posts", color: "#FF5A36" },
    { label: "Subscribers", value: subs, href: "/admin/subscribers", color: "#14A3E1" },
    { label: "New stories", value: newStories, href: "/admin/submissions", color: "#7C4DFF" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Kumusta! 👋</h1>
      <p className="mt-1 text-muted">Here&apos;s what&apos;s happening on Tara Bucket.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-extrabold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">Recently edited</h2>
          <Link href="/admin/posts/new" className="text-sm font-semibold text-orange">
            + New post
          </Link>
        </div>
        {recent.length > 0 ? (
          <ul className="divide-y divide-line">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/posts/${p.id}/edit`}
                    className="truncate font-semibold text-ink hover:text-blue-dark"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-faint">
                    {categoryLabel(p.category)} · updated {formatDate(p.updatedAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                    p.status === "published"
                      ? "bg-green/15 text-green"
                      : "bg-orange/15 text-orange"
                  }`}
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No posts yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}
