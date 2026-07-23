import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

// Next 16 "proxy" (formerly middleware). First line of defense for the admin;
// pages/actions re-check server-side too.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(sessionOptions.cookieName)?.value;
  let authed = false;
  if (token) {
    try {
      const data = await unsealData<SessionData>(token, {
        password: sessionOptions.password as string,
      });
      authed = Boolean(data?.userId);
    } catch {
      authed = false;
    }
  }

  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
