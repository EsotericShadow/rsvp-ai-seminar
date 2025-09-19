import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { RsvpForm } from "@/components/RsvpForm";
import AnalyticsBeacon from "@/components/AnalyticsBeacon";

const LetterGlitch = dynamic(() => import("@/components/LetterGlitch"), {
  ssr: false,
});

export default function RsvpPage() {
  return (
    <div className="relative min-h-[100svh]">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <LetterGlitch
          glitchSpeed={20}
          centerVignette
          outerVignette
          smooth
          // brand-ish palette; tweak if you want more contrast
          glitchColors={['#A0AD92', '#6A7166', '#DFE5DC', '#30332E']}
          className="opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/60" />
        <div className="absolute inset-x-0 top-0 h-[45svh] bg-gradient-to-b from-black via-black/80 to-transparent" />
        <div className="absolute inset-0">
          <div
            className="pointer-events-none absolute -top-32 right-[-5rem] h-80 w-80 rounded-full bg-brand-sage/25 blur-[140px] animate-pulse-soft"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-[-3rem] left-[-6rem] h-72 w-72 rounded-full bg-brand-mid/35 blur-[120px] animate-pulse-soft"
            style={{ animationDelay: '1.6s' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Header: bigger logo (100% larger) */}
      <header className="pt-6 sm:pt-8">
        <div className="mx-auto flex justify-center px-4">
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-[2rem] bg-brand-ink/25 blur-lg"
              aria-hidden="true"
            />
            <Link
              href="https://evergreenwebsolutions.ca"
              target="_blank"
              rel="noreferrer"
              className="relative flex items-center rounded-[1.75rem] border border-white/12 bg-gradient-to-br from-black/92 via-brand-ink/88 to-black/82 px-5 py-2.5 shadow-[0_14px_32px_-20px_rgba(0,0,0,0.85)] transition hover:border-brand-sage/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-sage animate-float"
            >
              <span className="sr-only">Visit Evergreen Web Solutions</span>
              <Image
                src="/logo.svg"
                alt="Evergreen AI"
                width={100}
                height={50}
                priority
                className="h-auto w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main (mobile first) */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <AnalyticsBeacon />
        <div className="mx-auto max-w-3xl text-center text-white/90 mb-10 space-y-4 animate-fade-in-up">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            AI in Northern BC: Business Readiness Seminar
          </h1>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            Explore how artificial intelligence can accelerate northern industries, tourism, and community services. RSVP to join us on <strong className="text-white">October 23, 2025</strong> at the Sunshine Inn in Terrace, BC for an evening of hands-on demos, case studies, and practical roadmaps tailored to regional businesses.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm sm:text-base">
            <div className="min-w-[18rem] rounded-full border border-white/15 bg-black/40 px-5 py-2 text-white/75 animate-fade-in-up text-center sm:text-left" style={{ animationDelay: '0.1s' }}>
              <span className="font-medium text-white">When:</span> Thursday, October 23 · Doors 6:00 PM
            </div>
            <div className="min-w-[18rem] rounded-full border border-white/15 bg-black/40 px-5 py-2 text-white/75 animate-fade-in-up text-center sm:text-left" style={{ animationDelay: '0.18s' }}>
              <span className="font-medium text-white">Where:</span> Sunshine Inn Terrace · Jasmine Room
            </div>
            <div className="min-w-[18rem] rounded-full border border-white/15 bg-black/40 px-5 py-2 text-white/75 animate-fade-in-up text-center sm:text-left" style={{ animationDelay: '0.26s' }}>
              <span className="font-medium text-white">Hosted by:</span> Gabriel Lacroix · Evergreen Web Solutions
            </div>
          </div>
        </div>
        <div className="mx-auto grid max-w-3xl gap-8">
          <div className="glass rounded-2xl p-4 sm:p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="sr-only">AI in Northern BC — RSVP</h1>

            {/* You already made the form 5 steps; container here keeps it responsive */}
            <div className="space-y-6">
              <RsvpForm />
            </div>
          </div>
          <aside className="rounded-2xl border border-white/10 bg-black/55 p-6 sm:p-8 text-white/80 backdrop-blur animate-fade-in-up" style={{ animationDelay: '0.32s' }}>
            <h2 className="text-xl font-semibold text-white">Why attend?</h2>
            <ul className="mt-4 space-y-3 text-sm sm:text-base leading-relaxed">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-brand-sage animate-pulse-soft" aria-hidden="true" />
                Learn how AI can support forestry, logistics, and tourism operators facing northern supply-chain realities.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-brand-sage animate-pulse-soft" style={{ animationDelay: '0.4s' }} aria-hidden="true" />
                Get a step-by-step checklist to evaluate data readiness and vendor risk before you invest.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-brand-sage animate-pulse-soft" style={{ animationDelay: '0.8s' }} aria-hidden="true" />
                Connect with local leaders exploring automation, customer service co-pilots, and AI-assisted marketing.
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-white/10 bg-brand-ink/40 p-5">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-12">
                <div className="text-center sm:max-w-[17rem] sm:text-right">
                  <h3 className="text-lg font-semibold text-white">Meet Gabriel Lacroix</h3>
                  <p className="text-sm uppercase tracking-wide text-brand-sage/80">Founder, Evergreen Web Solutions</p>
                </div>
                <div className="hidden sm:block h-44 w-px rounded-full bg-white/15" aria-hidden="true" />
                <div className="flex justify-center sm:justify-start">
                  <div className="h-40 w-40 overflow-hidden rounded-full border border-white/15 shadow-[0_22px_44px_rgba(0,0,0,0.55)] sm:h-48 sm:w-48">
                    <Image
                      src="/gabriel-lacroix.jpg"
                      alt="Gabriel Lacroix"
                      width={320}
                      height={320}
                      priority
                      className="h-full w-full object-cover"
                      style={{ objectPosition: '50% 24%' }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm sm:text-base leading-relaxed">
                I’m Gabriel, and I help northern BC organizations modernize their digital presence and bring AI ideas to life without losing the human touch. Expect honest conversations about what works, what stalls projects, and where to start next week.
              </p>
              <p className="mt-3 text-sm text-white/60">
                Have questions up front? Email <a className="font-medium text-brand-sage hover:text-brand-light" href="mailto:gabriel.lacroix94@icloud.com">gabriel.lacroix94@icloud.com</a> and I’ll get back to you within a day.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-16 border-t border-white/5 bg-black/60 py-8 text-sm text-white/60 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-white/70 font-medium">Evergreen Web Solutions · Northern BC Digital Strategy</p>
            <p>Sunshine Inn Terrace · 4812 Hwy 16, Terrace, BC</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="mailto:gabriel.lacroix94@icloud.com" className="hover:text-brand-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage">
              gabriel.lacroix94@icloud.com
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://evergreenwebsolutions.ca" target="_blank" rel="noreferrer" className="hover:text-brand-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage">
              evergreenwebsolutions.ca
            </a>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} Evergreen Web Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
