import type { Metadata } from "next"
import EventLanding from "@/components/EventLanding"

export const metadata: Metadata = {
  title: "RSVP for AI in Northern BC: Information Session | Terrace, BC",
  description: "Reserve your seat for the AI in Northern BC information session on October 23, 2025. Learn about AI automation, machine learning, and custom AI integrations for Northern BC businesses. Free event at Sunshine Inn Terrace.",
  keywords: [
    "AI event RSVP",
    "Terrace BC AI seminar", 
    "Northern BC AI workshop",
    "AI automation seminar",
    "machine learning event",
    "AI business consulting",
    "Evergreen Web Solutions event"
  ],
  openGraph: {
    title: "RSVP for AI in Northern BC: Information Session",
    description: "Reserve your seat for the AI information session in Terrace, BC. Learn about AI automation, machine learning, and custom AI integrations for Northern BC businesses.",
    url: "https://rsvp.evergreenwebsolutions.ca/rsvp",
    images: [
      {
        url: "/api/og?title=RSVP for AI in Northern BC&subtitle=Information Session • Terrace, BC • October 23, 2025",
        width: 1200,
        height: 630,
        alt: "AI in Northern BC Information Session RSVP"
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RSVP for AI in Northern BC: Information Session",
    description: "Reserve your seat for the AI information session in Terrace, BC. Learn about AI automation, machine learning, and custom AI integrations.",
  },
  alternates: {
    canonical: "https://rsvp.evergreenwebsolutions.ca/rsvp",
  },
}

export default function RsvpPage() {
  return <EventLanding />
}
