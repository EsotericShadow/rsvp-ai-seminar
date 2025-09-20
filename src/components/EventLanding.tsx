"use client"

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, cubicBezier } from 'framer-motion'

import { RsvpForm } from '@/components/RsvpForm'

const StaticBackdrop = () => (
  <div className="relative h-full w-full bg-black" aria-hidden="true">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black/60" />
  </div>
)

const LetterGlitch = dynamic(() => import('@/components/LetterGlitch'), {
  ssr: false,
  loading: () => <StaticBackdrop />,
})

const detailItems = [
  {
    label: 'When',
    value: 'Thursday, October 23 · Doors 6:00 PM',
  },
  {
    label: 'Where',
    value: 'Sunshine Inn Terrace · Jasmine Room',
  },
  {
    label: 'Hosted by',
    value: 'Gabriel Lacroix · Evergreen Web Solutions',
  },
]

const takeaways = [
  'Hands-on demos showing how northern operators deploy AI safely.',
  'A readiness checklist you can apply with your team in under a week.',
  'Conversation time with peers solving similar labour and logistics gaps.',
]

const audience = [
  'Business owners and managers planning 2025 growth initiatives.',
  'Tourism, forestry, logistics, and municipal leaders modernizing services.',
  'Marketing and operations teams looking for automation that respects local values.',
]

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: cubicBezier(0, 0, 0.58, 1),
    },
  },
}

const scrollFadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: cubicBezier(0, 0, 0.58, 1) },
}

export default function EventLanding() {
  return (
    <div className="relative min-h-[100svh]">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <LetterGlitch
          glitchSpeed={20}
          centerVignette
          outerVignette
          smooth
          glitchColors={['#A0AD92', '#6A7166', '#DFE5DC', '#30332E']}
          className="opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black/60" />
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

      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="pt-6 sm:pt-8"
      >
        <div className="mx-auto flex justify-center px-4">
          <div className="relative">
            <div className="absolute -inset-2 rounded-[2rem] bg-brand-ink/25 blur-lg" aria-hidden="true" />
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
                width={110}
                height={54}
                priority
                className="h-auto w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center text-white/90 space-y-6"
        >
          <motion.span variants={itemVariants} className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-white/70">
            Limited seats · RSVP closes October 16
          </motion.span>
          <motion.h1 variants={itemVariants} className="text-3xl font-semibold tracking-tight sm:text-5xl">
            AI in Northern BC: Business Readiness Seminar
          </motion.h1>
          <motion.p variants={itemVariants} className="text-base leading-relaxed text-white/70 sm:text-lg">
            Spend one evening translating AI headlines into practical action for northern businesses. See tools that respect regional realities, hear what’s working for your neighbours, and leave with a roadmap you can deploy next week.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#rsvp-form"
              className="w-full sm:w-auto rounded-lg bg-brand-sage px-8 py-3 text-base font-semibold text-black shadow-lg shadow-brand-sage/30 transition hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
            >
              Reserve your seat now
            </Link>
            <Link
              href="mailto:gabriel.lacroix94@icloud.com"
              className="w-full sm:w-auto rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white/80 transition hover:border-brand-sage/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
            >
              Ask Gabriel a question first
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          {...scrollFadeIn}
          className="glass rounded-2xl border-white/10 p-4 mt-8 w-full max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="px-4 py-3 text-center"
              >
                <span className="block text-sm font-semibold text-white uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="block mt-1 text-white/70">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <motion.section
            id="rsvp-form"
            {...scrollFadeIn}
            className="glass rounded-2xl p-5 sm:p-6 md:p-8"
          >
            <div className="space-y-6 text-white/80">
              <header className="space-y-2 text-left">
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">Reserve your spot</h2>
                <p className="text-sm leading-relaxed text-white/60 sm:text-base">
                  The RSVP form is five quick steps. Seats are capped to keep conversations focused—if you’re on the fence, claim a seat and let us know you’re “Maybe attending.”
                </p>
              </header>
              <hr className="border-white/10" />
              <div className="space-y-6">
                <RsvpForm />
              </div>
              <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/60 sm:text-base">
                <strong className="text-white">Need group bookings?</strong> Email{' '}
                <a className="font-medium text-brand-sage hover:text-brand-light" href="mailto:gabriel.lacroix94@icloud.com">
                  gabriel.lacroix94@icloud.com
                </a>{' '}
                and we’ll coordinate seats for your team.
              </div>
            </div>
          </motion.section>

          <motion.aside
            {...scrollFadeIn}
            className="rounded-2xl border border-white/10 bg-black/55 p-6 sm:p-8 text-white/80 backdrop-blur"
          >
            <h2 className="text-xl font-semibold text-white sm:text-2xl">What you’ll take away</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
              {takeaways.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-brand-sage animate-pulse-soft" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-white/10 bg-brand-ink/40 p-5">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-center sm:max-w-[17rem] sm:text-left">
                  <h3 className="text-lg font-semibold text-white">Meet Gabriel Lacroix</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-sage/80">Founder, Evergreen Web Solutions</p>
                </div>
                <div className="hidden sm:block h-44 w-px rounded-full bg-white/15" aria-hidden="true" />
                <div className="flex justify-center sm:justify-end">
                  <div className="aspect-square w-full max-w-[18rem] overflow-hidden rounded-full border border-white/15 shadow-[0_22px_44px_rgba(0,0,0,0.55)] sm:max-w-[20rem] lg:max-w-[22rem] will-change-transform">
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
              <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
                “I help northern BC organizations modernize without losing the local heartbeat. Expect real examples, straight-talk about costs, and space to workshop your next move.”
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white">Who should attend?</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/70 sm:text-base">
                {audience.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-[6px] inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-sage/70" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>

        <motion.section
          {...scrollFadeIn}
          className="mx-auto mt-12 max-w-4xl rounded-2xl border border-white/10 bg-black/45 px-6 py-6 text-center text-white/80"
        >
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Let’s set your team up for momentum</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
            We’ll share a three-month action plan tailored to northern realities. Bring your questions, your blockers, and your curiosity—this session is built for conversation.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#rsvp-form"
              className="w-full sm:w-auto rounded-lg bg-brand-sage px-8 py-3 text-base font-semibold text-black shadow-lg shadow-brand-sage/30 transition hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
            >
              Save my seat
            </Link>
            <Link
              href="https://evergreenwebsolutions.ca"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white/80 transition hover:border-brand-sage/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
            >
              Learn about Evergreen Web Solutions
            </Link>
          </div>
        </motion.section>

        <motion.footer
          {...scrollFadeIn}
          className="mt-16 border-t border-white/10 bg-black/60 py-8 text-sm text-white/60"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-white/70 font-medium">Evergreen Web Solutions · Northern BC Digital Strategy</p>
              <p>Sunshine Inn Terrace · 4812 Hwy 16, Terrace, BC</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:gabriel.lacroix94@icloud.com"
                className="hover:text-brand-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
              >
                gabriel.lacroix94@icloud.com
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://evergreenwebsolutions.ca"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
              >
                evergreenwebsolutions.ca
              </a>
              <span aria-hidden="true">·</span>
              <Link
                href="/privacy"
                className="hover:text-brand-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
              >
                Privacy Policy
              </Link>
              <span aria-hidden="true">·</span>
              <span>© {new Date().getFullYear()} Evergreen Web Solutions</span>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  )
}
