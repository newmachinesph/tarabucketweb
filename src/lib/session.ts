import type { SessionOptions } from "iron-session";

// Config only - safe to import from Edge middleware (no next/headers here).
export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
};

const SESSION_SECRET = process.env.SESSION_SECRET;

// Fail fast in production if the cookie key is missing, too short, or left as the
// example placeholder — a weak/guessable key means forgeable admin sessions.
if (process.env.NODE_ENV === "production") {
  if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  }
  if (SESSION_SECRET.includes("change_me")) {
    throw new Error("SESSION_SECRET is still the example placeholder — set a real random value.");
  }
}

export const sessionOptions: SessionOptions = {
  password: SESSION_SECRET as string,
  cookieName: "tarabucket_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};
