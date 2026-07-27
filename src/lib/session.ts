import type { SessionOptions } from "iron-session";

// Config only - safe to import from Edge middleware (no next/headers here).
export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
};

// Fail at boot rather than at the first request iron-session tries to seal a cookie.
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be set to at least 32 characters.");
}

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "tarabucket_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};
