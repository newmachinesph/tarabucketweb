import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { newsletterSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
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
