import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Code of Conduct | AI in Northern BC Event",
  description: "Read the code of conduct for the AI in Northern BC information session. Our commitment to creating a respectful, inclusive, and professional environment for all attendees.",
  keywords: [
    "code of conduct",
    "AI event conduct",
    "professional behavior",
    "inclusive event",
    "respectful environment",
    "Evergreen Web Solutions"
  ],
  openGraph: {
    title: "Code of Conduct - AI in Northern BC Event",
    description: "Read the code of conduct for the AI in Northern BC information session. Our commitment to creating a respectful, inclusive, and professional environment.",
    url: "https://rsvp.evergreenwebsolutions.ca/conduct",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Code of Conduct - AI in Northern BC Event",
    description: "Read the code of conduct for the AI in Northern BC information session. Our commitment to creating a respectful, inclusive, and professional environment.",
  },
  alternates: {
    canonical: "https://rsvp.evergreenwebsolutions.ca/conduct",
  },
}

export default function ConductPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Code of Conduct</h1>
      <p className="mt-4 text-lg">Content coming soon...</p>
    </div>
  );
}