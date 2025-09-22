import type { Metadata } from "next"
import ProfessionalEventLanding from "@/components/ProfessionalEventLanding"

export const metadata: Metadata = {
  title: "AI in Northern BC: Information Session | Event Details",
  description: "Join us for an information session on AI, machine learning, and automation in Terrace, BC. Learn about AI agents, custom AI integrations, and RAG systems for Northern BC businesses. October 23, 2025 at Sunshine Inn Terrace.",
  keywords: [
    "AI information session",
    "Terrace BC AI event",
    "Northern BC AI workshop", 
    "machine learning seminar",
    "AI automation training",
    "business AI consulting",
    "AI agents workshop",
    "Evergreen Web Solutions"
  ],
  openGraph: {
    title: "AI in Northern BC: Information Session - Event Details",
    description: "Join us for an information session on AI, machine learning, and automation in Terrace, BC. Learn about AI agents, custom AI integrations, and RAG systems.",
    url: "https://rsvp.evergreenwebsolutions.ca/event",
    images: [
      {
        url: "/api/og?title=AI in Northern BC&subtitle=Information Session • Event Details • October 23, 2025",
        width: 1200,
        height: 630,
        alt: "AI in Northern BC Information Session Event Details"
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI in Northern BC: Information Session - Event Details",
    description: "Join us for an information session on AI, machine learning, and automation in Terrace, BC. Learn about AI agents, custom AI integrations, and RAG systems.",
  },
  alternates: {
    canonical: "https://rsvp.evergreenwebsolutions.ca/event",
  },
}

export default function EventPage() {
  return <ProfessionalEventLanding />
}