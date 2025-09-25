"use client"

import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion, cubicBezier } from "framer-motion"
import StructuredData from "./StructuredData"

// RsvpForm must be client-only
const RsvpForm = dynamic(
  () => import("@/components/ProfessionalRsvpForm").then((m) => m.ProfessionalRsvpForm),
  { ssr: false }
)

// --- Design Tokens ----------------------------------------------------
const EASE = cubicBezier(0.25, 0.46, 0.45, 0.94)
const EASE_OUT = cubicBezier(0.16, 1, 0.3, 1)

// --- Data ------------------------------------------------------
const VENUE_ADDRESS = "4812 Hwy 16, Terrace, BC, Canada"
const VENUE_NAME = "Sunshine Inn Terrace — Jasmine Room"
const EVENT_NAME = "AI for Business Informational Event"
const START_ISO = "2025-10-23T17:00:00-07:00"
const END_ISO = "2025-10-23T19:00:00-07:00"

const ICS_URL = `/api/ics?title=${encodeURIComponent(
  EVENT_NAME
)}&start=${encodeURIComponent(START_ISO)}&end=${encodeURIComponent(
  END_ISO
)}&location=${encodeURIComponent(`${VENUE_NAME}, ${VENUE_ADDRESS}`)}&desc=${encodeURIComponent(
  "A plain-language evening for Northern BC businesses: real local examples and clear first steps for adopting AI."
)}`

const detailItems: Array<{ label: string; value: string; href?: string; icon: string }> = [
  {
    label: "When",
    value: "Thu, Oct 23 · 5:00–7:00 PM",
    href: ICS_URL,
    icon: "📅"
  },
  {
    label: "Where",
    value: VENUE_NAME,
    href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${VENUE_NAME} ${VENUE_ADDRESS}`),
    icon: "📍"
  },
  {
    label: "Hosted by",
    value: "Gabriel Lacroix • Evergreen Web Solutions",
    icon: "👨‍💼"
  },
]

const benefits = [
  {
    icon: "🎯",
    title: "Real Local Examples",
    description: "See AI automation, machine learning, and custom integrations from Northern BC industries"
  },
  {
    icon: "📋",
    title: "Practical Checklist",
    description: "Evaluate AI agents, RAG systems, and automation solutions for your business"
  },
  {
    icon: "🤝",
    title: "Network & Connect",
    description: "Meet other Northern BC business leaders implementing AI and digital transformation"
  }
]

const testimonials = [
  {
    quote: "Gabriel not only solved my computer problem, but as a bonus he got my new iPhone connected. Telus couldn't do it, but Gabriel had no problems. He doesn't walk on water, but he wades real high.",
    author: "Jim Lynch",
    role: "Community Leader"
  },
  {
    quote: "Gabriel built my company website. He did a fantastic job. I would not hesitate to recommend him and his abilities anytime.",
    author: "Jack Cook",
    role: "Karma Training"
  },
  {
    quote: "I was blown away with the results! Gabriel was very professional and easy to work with. He delivered the website very quickly with minimal revisions needed.",
    author: "Kaden Chad",
    role: "3D Animator"
  }
]

// --- Animation Variants --------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    } 
  },
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: EASE_OUT 
    } 
  },
}

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: EASE_OUT },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

export default function ProfessionalEventLanding() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 scroll-smooth">
      {/* Structured Data */}
      <StructuredData type="event" />
      <StructuredData type="breadcrumb" />

      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0fdf4' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }} />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.header 
            variants={itemVariants}
            className="pt-8 pb-4"
          >
            <Link
              href="https://evergreenwebsolutions.ca"
              target="_blank"
              rel="noreferrer"
              className="block w-full max-w-5xl mx-auto"
            >
              <Image
                src="/AI_in_terrace.svg"
                alt="AI in Northern BC"
                width={1200}
                height={600}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </Link>
          </motion.header>

          {/* Hero Content */}
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm mb-8"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Limited Seats Available • RSVP Closes Oct 16
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 mb-6"
            >
              <span className="block">AI in Northern BC</span>
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Information Session
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8"
            >
              Cut through the AI hype with real Northern BC examples. 
              <span className="font-semibold text-gray-900"> Learn what works, what it costs, and where to start.</span>
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link
                href="#rsvp-form"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
              >
                <span className="relative z-10">Reserve Your Seat</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="mailto:gabriel.lacroix94@icloud.com"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300"
              >
                Questions? Email Gabriel
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Free Event</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span>2 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Plain Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Local Examples</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Event Details Card */}
      <motion.div 
        {...fadeInUp}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {detailItems.map((item, index) => (
              <div key={item.label} className="p-6 text-center group hover:bg-gray-50 transition-colors duration-300">
                <div className="text-3xl mb-3">{item.icon}</div>
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {item.label}
                </span>
                {item.href ? (
                  <a 
                    href={item.href} 
                    className="text-gray-900 font-medium hover:text-emerald-600 transition-colors duration-300"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* RSVP Form */}
          <motion.div 
            {...fadeInUp}
            className="lg:col-span-2"
            id="rsvp-form"
            style={{ scrollMarginTop: '2rem' }}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">Reserve Your Spot</h2>
                <p className="text-emerald-100">
                  Join 50+ Northern BC business leaders. Takes 2 minutes to complete.
                </p>
              </div>
              <div className="p-8">
                <RsvpForm />
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            {...fadeInUp}
            className="space-y-8"
          >
            {/* What You'll Learn */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What You&apos;ll Learn</h3>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-2xl">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Speaker Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-emerald-400 flex-shrink-0">
                    <Image
                      src="/gabriel-lacroix.jpg"
                      alt="Gabriel Lacroix"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Gabriel Lacroix</h3>
                    <p className="text-emerald-400 text-sm font-medium">Founder, Evergreen Web Solutions</p>
                  </div>
                </div>
                <blockquote className="text-gray-300 italic leading-relaxed">
                  &ldquo;This event isn&apos;t about tech hype. It&apos;s about showing what AI really does for businesses here in the North.&rdquo;
                </blockquote>

              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What Others Say</h3>
              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="border-l-4 border-emerald-400 pl-4"
                  >
                    <p className="text-gray-700 italic mb-2">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-gray-500">{testimonial.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.section 
        {...fadeInUp}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Give Your Team a Clear Starting Point
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            You&apos;ll leave knowing where to start, what it might cost, and how to tell if it&apos;s working.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#rsvp-form"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-600 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Reserve Your Seat
            </Link>
            <Link
              href="https://evergreenwebsolutions.ca"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Learn About Evergreen Web Solutions
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        {...fadeInUp}
        className="bg-gray-900 text-white py-12"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Evergreen Web Solutions Logo"
                  width={60}
                  height={30}
                  className="w-12 h-6 sm:w-16 sm:h-8"
                />
                <span className="text-lg sm:text-xl font-bold">Evergreen Web Solutions</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI and Digital Strategy for Northern BC
              </p>
              <p className="text-gray-500 text-sm">
                <a
                  className="hover:text-emerald-400 transition-colors"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${VENUE_NAME} ${VENUE_ADDRESS}`)}`}
                  target="_blank"
                >
                  {VENUE_NAME} • {VENUE_ADDRESS}
                </a>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <a href="mailto:gabriel.lacroix94@icloud.com" className="hover:text-emerald-400 transition-colors">
                gabriel.lacroix94@icloud.com
              </a>
              <a href="https://evergreenwebsolutions.ca" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                evergreenwebsolutions.ca
              </a>
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/conduct" className="hover:text-emerald-400 transition-colors">
                Code of Conduct
              </Link>
              <span className="text-gray-600">© {new Date().getFullYear()} Evergreen Web Solutions</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
