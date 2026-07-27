"use client";

import { useState } from "react";

const field =
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-faint focus:border-blue";

export function StoryForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    title: "",
    story: "",
  });
  const [website, setWebsite] = useState(""); // honeypot — must stay empty
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
        setMessage(data.message);
        setForm({ name: "", email: "", location: "", title: "", story: "" });
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again?");
    }
  }

  if (status === "ok") {
    return (
      <div role="status" aria-live="polite" className="rounded-3xl bg-green/10 p-8 text-center">
        <span className="text-4xl">🎉</span>
        <p className="mt-3 text-lg font-bold text-green">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {/* Honeypot: hidden from users, catches bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Your name</label>
          <input className={field} required value={form.name} onChange={set("name")} placeholder="Juan dela Cruz" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Email</label>
          <input className={field} type="email" required value={form.email} onChange={set("email")} placeholder="you@email.com" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Location</label>
          <input className={field} value={form.location} onChange={set("location")} placeholder="Siargao, Surigao del Norte" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Story title</label>
          <input className={field} required value={form.title} onChange={set("title")} placeholder="How I finally surfed Cloud 9" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Your story</label>
        <textarea
          className={`${field} min-h-40 resize-y`}
          required
          value={form.story}
          onChange={set("story")}
          placeholder="Tell us what you ticked off your list, and what it meant to you…"
        />
      </div>
      {status === "error" && (
        <p role="alert" aria-live="assertive" className="text-sm font-medium text-red">{message}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="justify-self-start rounded-full bg-orange px-7 py-3.5 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(255,90,54,0.7)] transition-all hover:bg-orange-dark hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Submit my story"}
      </button>
    </form>
  );
}
