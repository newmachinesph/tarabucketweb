import Link from "next/link";
import { getAllPostsAdmin } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await getAllPostsAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Posts</h1>
          <p className="text-muted">{posts.length} total</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark"
        >
          + New post
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-5 py-3 font-bold">Title</th>
                  <th className="px-5 py-3 font-bold">Category</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/50">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/posts/${p.id}/edit`}
                        className="font-semibold text-ink hover:text-blue-dark"
                      >
                        {p.title}
                      </Link>
                      {p.featured && (
                        <span className="ml-2 text-xs font-bold text-orange">★</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {categoryLabel(p.category)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          p.status === "published"
                            ? "bg-green/15 text-green"
                            : "bg-orange/15 text-orange"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-faint">
                      {formatDate(p.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-muted">
          No posts yet.{" "}
          <Link href="/admin/posts/new" className="font-semibold text-orange">
            Create your first →
          </Link>
        </div>
      )}
    </div>
  );
}
