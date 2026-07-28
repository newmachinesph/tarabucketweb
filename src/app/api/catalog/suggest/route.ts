import { NextResponse } from "next/server";
import { suggestCatalog } from "@/lib/catalog";
import { suggestSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  // Typeahead fires per keystroke, so the ceiling is far higher than the
  // newsletter's 5/min — this only exists to stop a scripted flood.
  const limit = rateLimit(`suggest:${clientIp(req)}`, 40, 10_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = suggestSchema.safeParse({
    q: new URL(req.url).searchParams.get("q") ?? "",
  });
  // A too-short query is the normal state while typing, not a client error.
  if (!parsed.success) return NextResponse.json({ items: [] });

  try {
    const items = await suggestCatalog(parsed.data.q);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Could not load suggestions." }, { status: 500 });
  }
}
