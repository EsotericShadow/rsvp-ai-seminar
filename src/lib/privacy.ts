export type PrivacyPolicySection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type PrivacyPolicy = {
  title: string
  updatedAt: string
  summary: string
  sections: PrivacyPolicySection[]
  dataSharing: {
    heading: string
    paragraphs: string[]
    bullets: string[]
  }
  rights: {
    heading: string
    paragraphs: string[]
    bullets: string[]
  }
  contact: {
    heading: string
    paragraphs: string[]
    email: string
  }
}

const fallbackPolicy: PrivacyPolicy = {
  title: "Privacy Policy",
  updatedAt: "September 20, 2025",
  summary:
    "This policy details the data we collect, how we use it, and your rights regarding your information. We are committed to protecting your privacy and handling your data in an open and transparent manner.",
  sections: [
    {
      heading: "Information We Collect",
      paragraphs: [
        "We collect information to provide and improve our services. This includes information you provide directly to us, as well as information we collect automatically when you use our website.",
      ],
    },
    {
      heading: "Information You Provide",
      paragraphs: [
        "When you RSVP to an event, we collect the following information:",
      ],
      bullets: [
        "Full Name",
        "Email Address",
        "Organization",
        "Phone Number",
        "Attendance Status",
        "Attendee Count",
        "Dietary Preferences",
        "Accessibility Needs",
        "Referral Source",
        "Learning Goals",
      ],
    },
    {
      heading: "Information We Collect Automatically",
      paragraphs: [
        "When you visit our website, we automatically collect a wide range of technical and behavioral information to help us understand how our site is used and to improve our services. This includes:",
      ],
      bullets: [
        "**Identification:** A unique visitor ID and session ID, stored in cookies.",
        "**Page Information:** The path and query string of the pages you visit, and the referrer URL.",
        "**Marketing Information:** UTM parameters and ad click IDs (e.g., gclid, fbclid) from our marketing campaigns.",
        "**Device & Browser Information:** User agent, browser type and version, operating system, device type, screen dimensions, viewport dimensions, device pixel ratio, and language preferences.",
        "**Connection & Performance:** Network information (e.g., downlink, effective type, RTT), browser storage capacity, and detailed performance timings for page loads.",
        "**User Interaction:** The maximum percentage of the page you have scrolled, counts of clicks, keypresses, and copy events, and a timeline of the page's visibility state.",
        "**Geolocation:** Your approximate country, region, and city, derived from your IP address. Your full IP address is never stored; instead, we store a hashed version for security.",
      ],
    },
  ],
  dataSharing: {
    heading: "How We Share Data",
    paragraphs: [
      "We do not sell your personal information. We only share your data with trusted third-party services that help us operate and improve our services. These include:",
    ],
    bullets: [
      "**Hosting and Infrastructure:** We use Vercel for hosting our website and a Prisma-managed PostgreSQL database for data storage.",
      "**Email Delivery:** We use Resend to send campaign and confirmation emails.",
      "**Lead Management:** We use an external service called LeadMine to manage our business contacts and audience information. Your information may be synchronized with this service.",
      "**Legal Compliance:** We may disclose your information if required by law.",
    ],
  },
  rights: {
    heading: "Your Rights & Choices",
    paragraphs: [
      "You have rights and choices regarding your information:",
    ],
    bullets: [
      "**Unsubscribe:** You can unsubscribe from our email communications at any time by clicking the unsubscribe link in the footer of our emails.",
      "**Access, Correction, and Deletion:** You can request a copy of your data, or request that we correct or delete your data by contacting us at the email address below.",
      "**Cookie Management:** You can clear your browser cookies to reset our session and visitor tracking.",
      "**Do Not Track:** Our analytics beacon respects 'Do Not Track' signals from your browser.",
    ],
  },
  contact: {
    heading: "Contact Us",
    paragraphs: [
      "If you have any questions about this privacy policy or our data practices, please contact us.",
    ],
    email: "privacy@evergreenwebsolutions.ca",
  },
}

export async function getPrivacyPolicy(): Promise<{
  policy: PrivacyPolicy
  resolvedFrom: "remote" | "fallback"
}> {
  const url = process.env.PRIVACY_POLICY_URL?.trim()
  if (!url) {
    return { policy: fallbackPolicy, resolvedFrom: "fallback" }
  }

  try {
    const response = await fetch(url, {
      cache: "force-cache",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.warn(`Privacy fetch failed (${response.status}). Using fallback.`);
      return { policy: fallbackPolicy, resolvedFrom: "fallback" };
    }

    const policy = (await response.json()) as PrivacyPolicy
    return { policy, resolvedFrom: "remote" }
  } catch (error) {
    console.error("Failed to fetch remote privacy policy", error)
    return { policy: fallbackPolicy, resolvedFrom: "fallback" }
  }
}
