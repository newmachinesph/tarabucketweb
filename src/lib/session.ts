import type { SessionOptions } from "iron-session";

// Config only - safe to import from Edge middleware (no next/headers here).
export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "tarabucket_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};
