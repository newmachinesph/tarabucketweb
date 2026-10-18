"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Check, Download } from "lucide-react";
import { useMounted } from "@/lib/local-store";
import { decodeList } from "@/lib/list-transfer";
import { importProgress } from "@/lib/progress";

/**
 * Restore a bucket list from a backup link.
 *
 * The token is read from the query string on the client rather than on the server, on
 * purpose: the list stays out of server logs, out of the referrer chain, and off any
 * analytics that records full URLs. It is the reader's data and it never needs to leave
 * their device.
 *
 * The import is explicit — we show what the link contains and wait for a tap. Auto-importing
 * on page load would mean a link opened out of curiosity silently rewrites the list of
 * whoever opened it.
 */
export function RestoreClient() {
  const mounted = useMounted();
  const params = useSearchParams();
  const token = params.get("d");
  const [result, setResult] = useState<{ addedDone: number; addedSaved: number } | null>(null);

  const payload = useMemo(() => (token ? decodeList(token) : null), [token]);

  if (!mounted) {
    return <p className="text-muted">Reading your link&hellip;</p>;
  }

  if (!token) {
    return (
      <Notice
        tone="neutral"
        title="No backup link here."
        body="Open the link you saved from your profile — it looks like /restore?d=… — or head back to your progress."
      />
    );
  }

  if (!payload) {
    return (
      <Notice
        tone="warn"
        title="That link didn't work."
        body="It may have been cut short when it was pasted — chat apps sometimes clip long links. Try copying it again from wherever you saved it, in full."
      />
    );
  }

  const savedOn = payload.t ? new Date(payload.t * 1000) : null;
  const total = payload.done.length + payload.saved.length;

  if (result) {
    const added = result.addedDone + result.addedSaved;
    return (
      <div className="rounded-3xl border border-line bg-cream/50 p-7">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
          <Check size={20} className="text-green" aria-hidden /> Restored.
        </h2>
        <p className="mt-2 text-muted text-pretty">
          {added === 0
            ? "Everything in that link was already on this device — nothing changed."
            : `Added ${result.addedDone} done and ${result.addedSaved} saved. Anything already here was kept.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
          >
            See your progress
          </Link>
          <Link
            href="/explore"
            className="rounded-full border-2 border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            Keep going
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-7">
      <h2 className="text-xl font-extrabold text-ink">This link holds {total} entries</h2>
      <p className="mt-1.5 text-muted">
        {payload.done.length} ticked off · {payload.saved.length} saved for later
        {savedOn && ` · backed up ${savedOn.toLocaleDateString("en-PH", { dateStyle: "medium" })}`}
      </p>

      <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm text-ink">
        Restoring <strong>adds</strong> these to whatever is already on this device. Nothing
        currently in your list gets removed or overwritten.
      </p>

      <button
        type="button"
        onClick={() => setResult(importProgress(payload.done, payload.saved))}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Download size={17} aria-hidden /> Restore to this device
      </button>

      {payload.done.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-orange">
            See what&rsquo;s in it
          </summary>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {payload.done.slice(0, 30).map((e) => (
              <li key={e.id}>· {e.title}</li>
            ))}
            {payload.done.length > 30 && (
              <li className="text-faint">…and {payload.done.length - 30} more</li>
            )}
          </ul>
        </details>
      )}
    </div>
  );
}

function Notice({
  tone,
  title,
  body,
}: {
  tone: "neutral" | "warn";
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white p-7">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
        {tone === "warn" && <AlertTriangle size={20} className="text-orange" aria-hidden />}
        {title}
      </h2>
      <p className="mt-2 text-muted text-pretty">{body}</p>
      <Link
        href="/profile"
        className="mt-6 inline-block rounded-full border-2 border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
      >
        Back to my progress
      </Link>
    </div>
  );
}
