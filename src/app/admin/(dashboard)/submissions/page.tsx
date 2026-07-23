import { desc } from "drizzle-orm";
import { db } from "@/db";
import { storySubmissions } from "@/db/schema";
import { timeAgo } from "@/lib/format";
import { setSubmissionStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-violet/15 text-violet",
  published: "bg-green/15 text-green",
  archived: "bg-faint/20 text-muted",
};

export default async function SubmissionsPage() {
  const items = await db
    .select()
    .from(storySubmissions)
    .orderBy(desc(storySubmissions.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Story submissions</h1>
      <p className="mb-6 text-muted">
        Reader-submitted stories. Publish the best ones to the Stories page.
      </p>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-ink">{s.title}</h2>
                  <p className="text-sm text-muted">
                    {s.name} · {s.email} · {s.location || "Philippines"} ·{" "}
                    {timeAgo(s.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[s.status] ?? ""}`}
                >
                  {s.status}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-muted">{s.story}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {s.status !== "published" && (
                  <form action={setSubmissionStatus.bind(null, s.id, "published")}>
                    <button className="rounded-full bg-green px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      Publish
                    </button>
                  </form>
                )}
                {s.status !== "archived" && (
                  <form action={setSubmissionStatus.bind(null, s.id, "archived")}>
                    <button className="rounded-full border-2 border-line px-4 py-2 text-sm font-semibold text-muted hover:bg-surface">
                      Archive
                    </button>
                  </form>
                )}
                {s.status !== "new" && (
                  <form action={setSubmissionStatus.bind(null, s.id, "new")}>
                    <button className="rounded-full border-2 border-line px-4 py-2 text-sm font-semibold text-muted hover:bg-surface">
                      Mark as new
                    </button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-muted">
          No submissions yet.
        </div>
      )}
    </div>
  );
}
