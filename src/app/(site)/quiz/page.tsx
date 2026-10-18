import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/fx";
import { QuizClient } from "@/components/quiz/quiz-client";
import { quizItems, QUIZ_SIZE } from "@/lib/quiz";
import { CATALOG_SIZE } from "@/lib/progress-constants";
import { SITE } from "@/lib/site";

// The item set rotates weekly (see `quizEdition`), so a day of cache is safe and keeps the
// page static for the traffic spikes this surface is built to absorb.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "How many have you done?",
  description:
    "A 2-minute Philippine bucket-list quiz. Swipe through the icons, get your score, and keep it as your bucket list. No sign-up.",
  alternates: { canonical: "/quiz" },
  openGraph: {
    title: "How many of these have you done?",
    description:
      "Swipe through Philippine bucket-list icons and find out your number. Two minutes, no sign-up.",
    url: "/quiz",
    type: "website",
  },
};

export default async function QuizPage() {
  const items = await quizItems();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "How many Philippine bucket-list icons have you done?",
    about: { "@type": "Thing", name: "Philippine travel" },
    educationalLevel: "beginner",
    url: `${SITE.url.replace(/\/$/, "")}/quiz`,
    numberOfQuestions: items.length,
  };

  return (
    <div className="container-tara py-12 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-2xl">
        <Reveal>
          <header className="mb-10 text-center">
            <p className="kicker mb-4 text-orange">The {QUIZ_SIZE}-second sort</p>
            <h1 className="display text-5xl text-ink sm:text-6xl">
              How many have you <span className="display-italic text-orange">done</span>?
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted text-pretty">
              {`Swipe through ${items.length} Philippine icons, one tap each. At the end you get your
              number — and a bucket list that's already started.`}
            </p>
            <p className="mt-3 text-sm text-faint">
              About two minutes · no sign-up · {CATALOG_SIZE.toLocaleString()} more where these
              came from
            </p>
          </header>
        </Reveal>

        <QuizClient items={items} />

        <p className="mt-10 text-center text-sm text-faint">
          Rather browse than swipe?{" "}
          <Link href="/explore" className="font-semibold text-muted underline underline-offset-2 hover:text-orange">
            See the whole catalog
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
