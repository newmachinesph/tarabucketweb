import { NextResponse } from "next/server";
import { db } from "@/db";
import { storySubmissions } from "@/db/schema";
import { storySchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Stories are heavier (up to 6k chars) — throttle harder than the newsletter.
  const limit = rateLimit(`stories:${clientIp(req)}`, 3, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You've submitted a few stories already. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => null);
  // Honeypot: real users never fill the hidden `website` field.
  if (body && typeof body === "object" && (body as { website?: string }).website) {
    return NextResponse.json({
      message: "Salamat! Your story is in review - we'll be in touch. 🙌",
    });
  }
  const parsed = storySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form" },
      { status: 400 },
    );
  }
  try {
    await db.insert(storySubmissions).values(parsed.data);
    return NextResponse.json({
      message: "Salamat! Your story is in review - we'll be in touch. 🙌",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not send your story right now. Try again?" },
      { status: 500 },
    );
  }
}
