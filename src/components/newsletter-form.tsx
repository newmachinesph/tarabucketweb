"use client";

import { useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
        setMessage(data.message ?? "You're on the list. Tara! 🪣");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again?");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again?");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-2xl bg-green/10 px-5 py-4 text-center font-semibold text-green">
        {message}
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full gap-2 ${compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row"}`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        aria-label="Email address"
        className="w-full flex-1 rounded-full border-2 border-line bg-white px-5 py-3 text-ink outline-none transition-colors placeholder:text-faint focus:border-blue"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-full bg-orange px-6 py-3 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(255,90,54,0.7)] transition-all hover:bg-orange-dark hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : "Join the list"}
      </button>
      {status === "error" && (
        <p className="mt-1 w-full text-sm font-medium text-red sm:absolute sm:mt-14">
          {message}
        </p>
      )}
    </form>
  );
}
