"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "../logo";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/submissions", label: "Stories" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark size={26} />
          <span className="font-extrabold text-ink">Studio</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                isActive(l.href)
                  ? "bg-surface text-blue-dark"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts/new"
            className="rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
          >
            + New post
          </Link>
          <span className="hidden text-sm text-faint sm:inline">{userName}</span>
          <form action={logoutAction}>
            <button className="text-sm font-semibold text-muted hover:text-red">
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
