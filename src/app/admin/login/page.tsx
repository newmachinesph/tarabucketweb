"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
            <LogoMark size={32} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink">
            Tara Bucket Studio
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage content</p>
        </div>

        <form
          action={formAction}
          className="rounded-3xl border border-line bg-white p-7 shadow-sm"
        >
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mb-4 w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-blue"
            placeholder="admin@tarabucket.ph"
          />
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-blue"
            placeholder="••••••••"
          />

          {state?.error && (
            <p className="mt-4 rounded-xl bg-red/10 px-4 py-2.5 text-sm font-medium text-red">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-full bg-blue py-3.5 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(20,163,225,0.7)] transition-all hover:bg-blue-dark active:scale-95 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-faint">
          ← <Link href="/" className="hover:text-blue-dark">Back to Tara Bucket</Link>
        </p>
      </div>
    </div>
  );
}
