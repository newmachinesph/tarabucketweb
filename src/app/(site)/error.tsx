"use client";

import Link from "next/link";

// Route-level error boundary for the public site. Catches render/data errors so a
// single failing page doesn't white-screen the whole app.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <span className="text-5xl">🧭</span>
      <h1 className="mt-6 text-2xl font-extrabold text-ink">
        Naligaw tayo — something went wrong
      </h1>
      <p className="mt-3 text-muted">
        We hit a snag loading this page. Try again in a moment.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-faint">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-orange px-6 py-3 font-semibold text-white transition-all hover:bg-orange-dark active:scale-95"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border-2 border-line px-6 py-3 font-semibold text-ink transition-colors hover:bg-surface"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
