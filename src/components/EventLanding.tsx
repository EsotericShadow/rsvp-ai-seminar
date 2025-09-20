"use client"

import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import dynamic from "next/dynamic"
import { motion, cubicBezier } from "framer-motion"

// RsvpForm must be client-only
const RsvpForm = dynamic(
  () => import("@/components/RsvpForm").then((m) => m.RsvpForm),
  { ssr: false }
)

// --- Tokens ----------------------------------------------------
const EASE = cubicBezier(0.2, 0.8, 0.2, 1)
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm"

// --- Data ------------------------------------------------------
const VENUE_ADDRESS = "4812 Hwy 16, Terrace, BC, Canada"
const VENUE_NAME = "Sunshine Inn Terrace — Jasmine Room"
const EVENT_NAME = "AI in Northern BC: Information Session"
const START_ISO = "2025-10-23T18:00:00-07:00"
const END_ISO = "2025-10-23T20:30:00-07:00"

const ICS_URL = `/api/ics?title=${encodeURIComponent(
  EVENT_NAME
)}&start=${encodeURIComponent(START_ISO)}&end=${encodeURIComponent(
  END_ISO
)}&location=${encodeURIComponent(`${VENUE_NAME}, ${VENUE_ADDRESS}`)}&desc=${encodeURIComponent(
  "A plain-language evening for Northern BC businesses: real local examples and clear first steps for adopting AI."
)}`

const detailItems: Array<{ label: string; value: string; href?: string }> = [
  {
    label: "When",
    value: "Thu, Oct 23 · Doors 6:00 PM · 6:30–8:30 PM",
    href: ICS_URL,
  },
  {
    label: "Where",
    value: VENUE_NAME,
    href:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(`${VENUE_NAME} ${VENUE_ADDRESS}`),
  },
  {
    label: "Hosted by",
    value: "Gabriel Lacroix • Evergreen Web Solutions",
  },
]

const takeaways = [
  "Local examples that worked — and what they cost.",
  "A simple checklist to judge fit and risk for your business.",
  "Time to compare notes with nearby owners and managers.",
]

const audience = [
  "Owners, managers, and superintendents in mining, construction, forestry.",
  "Leaders in tourism, logistics, and local government.",
  "Office, admin, and operations teams looking to save time on routine work.",
]

// --- Variants --------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: EASE } },
}
const scrollFadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: EASE },
}

export default function EventLanding() {
  return (
    <div className="relative min-h-[100svh] bg-white text-gray-900">
      {/* JSON-LD */}
      <Script id="event-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BusinessEvent",
          name: EVENT_NAME,
          startDate: START_ISO,
          endDate: END_ISO,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: { "@type": "Place", name: VENUE_NAME, address: VENUE_ADDRESS },
          organizer: { "@type": "Organization", name: "Evergreen Web Solutions", url: "https://evergreenwebsolutions.ca" },
          image: ["https://yourdomain.com/og"],
          description:
            "A plain-language information session for Northern BC businesses. See real examples and leave with clear next steps.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "CAD", availability: "https://schema.org/InStock" },
        })}
      </Script>

      {/* Header / Logo */}
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: EASE }} className="pt-5 sm:pt-8">
        <div className="mx-auto flex justify-center px-4">
          <Link
            href="https://evergreenwebsolutions.ca"
            target="_blank"
            rel="noreferrer"
              className="relative flex items-center rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-brand-sage/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-sage w-[300px] h-[150px]"
            >
              <span className="sr-only">Visit Evergreen Web Solutions</span>
              <Image
                src="/AI_in_terrace.svg"
                alt="AI in Northern BC"
                width={300}
                height={150}
                priority
                sizes="300px"
                className="h-auto w-auto object-cover"
              />
          </Link>
        </div>
      </motion.header>

      {/* Main */}
      <main className="px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[68ch] py-10 sm:py-16 md:py-20 text-center space-y-5 sm:space-y-6"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] sm:tracking-[0.35em] text-gray-600"
          >
            Limited seats · RSVP closes Thu, Oct 16
          </motion.span>

          <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            {EVENT_NAME}
          </motion.h1>

          <motion.p variants={itemVariants} className="text-base leading-7 text-gray-700 sm:hidden">
            One evening. Plain language. Local examples. Clear first steps.
          </motion.p>
          <motion.p variants={itemVariants} className="hidden sm:block text-base sm:text-lg leading-8 text-gray-700">
            Spend one evening cutting through AI hype in plain language. See local examples from mining, construction, and forestry, and understand where AI could help your team and where it won’t.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#rsvp-form"
              className="w-full sm:w-auto rounded-lg bg-brand-sage px-6 sm:px-8 py-3 text-base font-semibold text-black shadow-sm hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
            >
              Reserve your seat
            </Link>
            <Link
              href="mailto:gabriel.lacroix94@icloud.com"
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-6 sm:px-8 py-3 text-base font-semibold text-gray-900 hover:border-brand-sage/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
            >
              Questions? Email Gabriel
            </Link>
          </motion.div>
        </motion.section>

        {/* Event details */}
        <motion.div {...scrollFadeIn} className={`${card} mx-auto mt-2 w-full max-w-3xl p-4`}>
          <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            {detailItems.map((item) => (
              <div key={item.label} className="px-4 py-3 text-center">
                <span className="block text-xs font-semibold text-gray-600 uppercase tracking-widest">{item.label}</span>
                {item.href ? (
                  <a href={item.href} className="mt-1 inline-block text-gray-800 hover:text-brand-sage">
                    {item.value}
                  </a>
                ) : (
                  <span className="block mt-1 text-gray-700">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Grid: Form + Aside */}
        <div className="mx-auto mt-8 sm:mt-10 grid max-w-5xl gap-6 sm:gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* Form */}
          <motion.section id="rsvp-form" {...scrollFadeIn} className={`${card} p-5 sm:p-8`}>
            <div className="space-y-6 text-gray-800">
              <header className="space-y-2 text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold">Reserve your spot</h2>
                <p className="text-sm sm:text-base leading-relaxed text-gray-600">
                  The form takes about a minute. Seats are limited. Not sure yet? Choose “Maybe attending.”
                </p>
              </header>
              <hr className="border-gray-200" />
              <div className="space-y-6" aria-live="polite">
                <RsvpForm />
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 sm:text-base">
                <strong className="text-gray-900">Booking for a team?</strong>{" "}
                Email{" "}
                <a className="font-medium text-brand-sage hover:text-brand-light" href="mailto:gabriel.lacroix94@icloud.com">
                  gabriel.lacroix94@icloud.com
                </a>{" "}
                and we’ll set aside seats.
              </div>
              <p className="text-xs text-gray-500">We use your email only for event updates. No marketing.</p>
            </div>
          </motion.section>

          {/* Aside */}
          <motion.aside {...scrollFadeIn} className={`${card} p-5 sm:p-8 text-gray-800`}>
            <h2 className="text-xl sm:text-2xl font-semibold">What you’ll take away</h2>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-sm sm:text-base leading-relaxed">
              {takeaways.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-brand-sage" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            {/* Speaker */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-center sm:max-w-[17rem] sm:text-left">
                  <h3 className="text-lg font-semibold">Meet Gabriel Lacroix</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-sage/80">Founder, Evergreen Web Solutions (Terrace, BC)</p>
                </div>
                <div className="hidden h-44 w-px rounded-full bg-gray-200 sm:block" />
                <div className="flex justify-center sm:justify-end">
                  <div className="aspect-square w-full max-w-[18rem] overflow-hidden rounded-full border border-gray-200 sm:max-w-[20rem] lg:max-w-[22rem]">
                    <Image
                      src="/gabriel-lacroix.jpg"
                      alt="Gabriel Lacroix"
                      width={320}
                      height={320}
                      sizes="(min-width:1024px) 320px, 50vw"
                      className="h-full w-full object-cover ring-1 ring-gray-200"
                      style={{ objectPosition: "50% 24%" }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-700">
                “My goal is clarity. I’ll walk through real northern projects, what they cost, and practical first steps that don’t disrupt operations.”
              </p>
            </div>

            {/* Audience */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Who should attend?</h3>
              <ul className="mt-3 space-y-2 text-sm sm:text-base leading-relaxed text-gray-700">
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

        {/* Closing CTA */}
        <motion.section {...scrollFadeIn} className={`${card} mx-auto mt-10 sm:mt-12 max-w-4xl px-5 sm:px-6 py-6 text-center`}>
          <h2 className="text-xl sm:text-2xl font-semibold">Give your team a clear starting point</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed text-gray-700">
            You’ll leave knowing where to start, what it might cost, and how to tell if it’s working.
          </p>
          <div className="mt-4 sm:mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#rsvp-form"
              className="w-full sm:w-auto rounded-lg bg-brand-sage px-6 sm:px-8 py-3 text-base font-semibold text-black shadow-sm hover:bg-brand-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
            >
              Reserve your seat
            </Link>
            <Link
              href="https://evergreenwebsolutions.ca"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-6 sm:px-8 py-3 text-base font-semibold text-gray-900 hover:border-brand-sage/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage"
            >
              Learn about Evergreen Web Solutions
            </Link>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer {...scrollFadeIn} className="mt-14 sm:mt-16 border-t border-gray-200 bg-gray-50 py-8 text-sm text-gray-600">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-gray-700 font-medium">
                <Image
                  src="/logo.svg"
                  alt="Evergreen Web Solutions Logo"
                  width={50}
                  height={25}
                  className="inline-block mr-2"
                />
                Evergreen Web Solutions · AI and Digital Strategy for Northern BC
              </p>
              <p>
                <a
                  className="hover:text-brand-sage"
                  href={
                    "https://www.google.com/maps/search/?api=1&query=" +
                    encodeURIComponent(`${VENUE_NAME} ${VENUE_ADDRESS}`)
                  }
                  target="_blank"
                >
                  Sunshine Inn Terrace · {VENUE_ADDRESS}
                </a>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="mailto:gabriel.lacroix94@icloud.com" className="hover:text-brand-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage">
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
              <Link href="/privacy" className="hover:text-brand-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage">
                Privacy Policy
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/conduct" className="hover:text-brand-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sage">
                Code of Conduct
              </Link>
              <span aria-hidden="true">·</span>
              <span className="text-gray-600">© {new Date().getFullYear()} Evergreen Web Solutions</span>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  )
}
