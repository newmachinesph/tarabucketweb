import type { ProgressEntry } from "@/lib/progress";

/**
 * Serialize a bucket list into a link — VIRAL.md's "Save My List", the anti-flop mechanic.
 *
 * The whole identity asset ("41/879 done") lives in one browser's localStorage. That is fine
 * until any of the following, all of which are routine:
 *
 *  - Messenger and Viber open links in their own in-app webview, with their own storage —
 *    which is precisely the surface every share object in the plan targets.
 *  - Clearing browsing data, switching phones, or private browsing.
 *
 * A lost list is not a lost feature, it is a churned evangelist telling their group chat that
 * the site ate their progress. So: one link that carries the whole list, works with no
 * account and no server, and can be pasted into Notes, emailed, or opened on a new phone.
 *
 * Deliberately *not* a server-side store — that would need the accounts roadmap, a table,
 * and a privacy story. This is the version that ships today and stays useful afterwards: the
 * same payload is what an account-claim flow would import later.
 */

/** Bumped when the payload shape changes, so an old link fails cleanly instead of importing
 *  garbage into someone's list. */
const FORMAT_VERSION = 1;

export type ListPayload = {
  v: number;
  /** Unix seconds — shown on the restore screen so a stale link is obvious. */
  t: number;
  done: ProgressEntry[];
  saved: ProgressEntry[];
};

/**
 * Entries carry denormalized display fields; a link only needs enough to rebuild them.
 * Trimming keeps the URL inside what chat apps and address bars tolerate.
 */
function compact(entries: ProgressEntry[]): ProgressEntry[] {
  return entries.map((e) => ({
    id: e.id,
    title: e.title,
    ...(e.region ? { region: e.region } : {}),
    ...(e.categoryKey ? { categoryKey: e.categoryKey } : {}),
    at: e.at,
  }));
}

/** URL-safe base64 (RFC 4648 §5) — `+/=` are all meaningful in a query string. */
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
}

/**
 * Encode to a URL-safe token.
 *
 * `encodeURIComponent` before base64 so non-ASCII titles (ñ, Bisaya, Tagalog) survive —
 * `btoa` throws on anything outside Latin-1, and place names here routinely contain it.
 */
export function encodeList(done: ProgressEntry[], saved: ProgressEntry[]): string {
  const payload: ListPayload = {
    v: FORMAT_VERSION,
    t: Math.floor(Date.now() / 1000),
    done: compact(done),
    saved: compact(saved),
  };
  const json = JSON.stringify(payload);
  const binary = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
  return toUrlSafe(btoa(binary));
}

/** Decode a token. Returns null for anything malformed — a bad link must never throw into
 *  the render path or clobber an existing list. */
export function decodeList(token: string): ListPayload | null {
  try {
    const binary = atob(fromUrlSafe(token));
    const json = decodeURIComponent(
      Array.from(binary)
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;

    const p = parsed as Partial<ListPayload>;
    if (p.v !== FORMAT_VERSION) return null;

    const entries = (value: unknown): ProgressEntry[] =>
      Array.isArray(value)
        ? value.filter(
            (e): e is ProgressEntry =>
              !!e &&
              typeof e === "object" &&
              typeof (e as ProgressEntry).id === "string" &&
              typeof (e as ProgressEntry).title === "string",
          )
        : [];

    return {
      v: FORMAT_VERSION,
      t: typeof p.t === "number" ? p.t : 0,
      done: entries(p.done),
      saved: entries(p.saved),
    };
  } catch {
    return null;
  }
}

/**
 * Merge an incoming list into the current one.
 *
 * Union, never replace: someone restoring on a phone that already has a few ticks should
 * end up with both, not whichever happened to be newer. Ties keep the earlier `at` — the
 * first time you did something is the true date, and it's what milestone counts key off.
 */
export function mergeEntries(
  current: ProgressEntry[],
  incoming: ProgressEntry[],
): ProgressEntry[] {
  const byId = new Map(current.map((e) => [e.id, e]));
  for (const entry of incoming) {
    const existing = byId.get(entry.id);
    if (!existing) {
      byId.set(entry.id, entry);
      continue;
    }
    if ((entry.at ?? "") && (!existing.at || entry.at < existing.at)) {
      byId.set(entry.id, { ...existing, at: entry.at });
    }
  }
  return [...byId.values()];
}
