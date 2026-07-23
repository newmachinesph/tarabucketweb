import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { sessionOptions, type SessionData } from "./session";

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function getCurrentUser(): Promise<SessionData | null> {
  const session = await getSession();
  if (!session.userId) return null;
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  };
}

/** Server-side gate for admin pages. Redirects to login when unauthenticated. */
export async function requireAdmin(): Promise<SessionData> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Returns the user row on valid credentials, else null. */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const normalized = email.toLowerCase().trim();
  const [user] = await db.select().from(users).where(eq(users.email, normalized));
  if (!user) {
    // Run a compare anyway to blunt user-enumeration timing.
    await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinv");
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
