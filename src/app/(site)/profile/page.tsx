import type { Metadata } from "next";
import { Reveal } from "@/components/fx";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = {
  alternates: { canonical: "/profile" },
  title: "Your progress",
  description:
    "Everything you've ticked off the Philippine bucket list, and everything you've saved for later.",
  // Personal, per-device, and identical for every crawler that hits it.
  robots: { index: false, follow: true },
};

export default function ProfilePage() {
  return (
    <div className="container-tara py-14">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <header className="mb-10 border-b border-line pb-8">
            <p className="kicker mb-4 text-orange">Your progress</p>
            <h1 className="display text-5xl text-ink sm:text-6xl">
              How far you&rsquo;ve <span className="display-italic text-orange">got</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted text-pretty">
              The Philippines has 7,641 islands and we&rsquo;ve catalogued the best of what
              to do on them. Here&rsquo;s your dent in it.
            </p>
          </header>
        </Reveal>

        <ProfileClient />
      </div>
    </div>
  );
}
