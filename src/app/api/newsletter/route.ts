import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { newsletterSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = rateLimit(`newsletter:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => null);
  // Honeypot: real users never fill the hidden `website` field.
  if (body && typeof body === "object" && (body as { website?: string }).website) {
    return NextResponse.json({ message: "You're on the list. Tara! 🪣" });
  }
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid email" },
      { status: 400 },
    );
  }
  try {
    await db
      .insert(subscribers)
      .values({ email: parsed.data.email })
      .onConflictDoNothing({ target: subscribers.email });
    return NextResponse.json({ message: "You're on the list. Tara! 🪣" });
  } catch {
    return NextResponse.json(
      { error: "Could not subscribe right now. Try again?" },
      { status: 500 },
    );
  }
}
