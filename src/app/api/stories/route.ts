import { NextResponse } from "next/server";
import { db } from "@/db";
import { storySubmissions } from "@/db/schema";
import { storySchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
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
