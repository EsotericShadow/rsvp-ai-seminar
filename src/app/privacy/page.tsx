import type { Metadata } from "next";

import { getPrivacyPolicy } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | AI in Northern BC Event RSVP",
  description:
    "Review Evergreen Web Solutions' privacy policy to understand how event RSVP and visit data are collected, used, and protected. Learn about our commitment to data privacy and security.",
  keywords: [
    "privacy policy",
    "data protection",
    "RSVP privacy",
    "event data privacy",
    "Evergreen Web Solutions privacy",
    "AI event privacy",
    "data security"
  ],
  openGraph: {
    title: "Privacy Policy - AI in Northern BC Event RSVP",
    description: "Review Evergreen Web Solutions' privacy policy to understand how event RSVP and visit data are collected, used, and protected.",
    url: "https://rsvp.evergreenwebsolutions.ca/privacy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy - AI in Northern BC Event RSVP",
    description: "Review Evergreen Web Solutions' privacy policy to understand how event RSVP and visit data are collected, used, and protected.",
  },
  alternates: {
    canonical: "https://rsvp.evergreenwebsolutions.ca/privacy",
  },
};

export default async function PrivacyPage() {
  const { policy, resolvedFrom } = await getPrivacyPolicy();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-sage/80">Evergreen Web Solutions</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">{policy.title}</h1>
          <p className="text-base text-white/70 sm:text-lg">{policy.summary}</p>
          <p className="text-sm text-white/50">Last updated: {policy.updatedAt}</p>
          {resolvedFrom === "fallback" ? (
            <p className="text-xs text-amber-300/80">
              Showing a fallback copy. Visit
              <a
                className="ml-1 underline hover:text-amber-200"
                href="https://evergreenwebsolutions.ca/privacy"
                target="_blank"
                rel="noreferrer"
              >
                evergreenwebsolutions.ca/privacy
              </a>
              for the latest version.
            </p>
          ) : null}
        </header>

        <div className="space-y-12">
          {policy.sections.map((section) => (
            <article key={section.heading} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold sm:text-2xl">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-white/70 sm:text-base">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-5 text-sm text-white/70 sm:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet.slice(0, 60)}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}

          <article className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold sm:text-2xl">{policy.dataSharing.heading}</h2>
            {policy.dataSharing.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-white/70 sm:text-base">
                {paragraph}
              </p>
            ))}
            <ul className="list-disc space-y-2 pl-5 text-sm text-white/70 sm:text-base">
              {policy.dataSharing.bullets.map((bullet) => (
                <li key={bullet.slice(0, 60)}>{bullet}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold sm:text-2xl">{policy.rights.heading}</h2>
            {policy.rights.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-white/70 sm:text-base">
                {paragraph}
              </p>
            ))}
            <ul className="list-disc space-y-2 pl-5 text-sm text-white/70 sm:text-base">
              {policy.rights.bullets.map((bullet) => (
                <li key={bullet.slice(0, 60)}>{bullet}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold sm:text-2xl">{policy.contact.heading}</h2>
            {policy.contact.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-white/70 sm:text-base">
                {paragraph}
              </p>
            ))}
            <p className="text-sm text-white/80 sm:text-base">
              Contact: <a className="text-brand-sage hover:text-brand-light" href={`mailto:${policy.contact.email}`}>{policy.contact.email}</a>
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
