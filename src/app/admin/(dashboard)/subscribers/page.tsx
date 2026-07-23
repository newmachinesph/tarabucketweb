import { desc } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { formatDate } from "@/lib/format";
import { deleteSubscriber } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const list = await db
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.createdAt));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Subscribers</h1>
          <p className="text-muted">{list.length} on the weekly bucket list</p>
        </div>
        {list.length > 0 && (
          <a
            href={`mailto:?bcc=${list.map((s) => s.email).join(",")}`}
            className="rounded-full border-2 border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
          >
            Email all (BCC)
          </a>
        )}
      </div>

      {list.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-faint">
              <tr>
                <th className="px-5 py-3 font-bold">Email</th>
                <th className="px-5 py-3 font-bold">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3.5 font-semibold text-ink">{s.email}</td>
                  <td className="px-5 py-3.5 text-faint">{formatDate(s.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <form action={deleteSubscriber.bind(null, s.id)}>
                      <button className="text-sm font-semibold text-red hover:underline">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-muted">
          No subscribers yet.
        </div>
      )}
    </div>
  );
}
