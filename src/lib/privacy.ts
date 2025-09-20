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
  updatedAt: "See evergreenwebsolutions.ca",
  summary:
    "We’re unable to load the shared privacy policy right now. You can review the most recent version at https://evergreenwebsolutions.ca/privacy or contact privacy@evergreenwebsolutions.ca for a copy.",
  sections: [],
  dataSharing: {
    heading: "How We Share Data",
    paragraphs: [
      "We limit sharing to trusted providers and do not sell personal information.",
    ],
    bullets: [
      "Hosting and infrastructure partners (e.g., Vercel, Prisma-managed PostgreSQL).",
      "Email delivery partners (e.g., Resend) to send confirmations and updates.",
      "Legal compliance when required by applicable law.",
    ],
  },
  rights: {
    heading: "Your Choices",
    paragraphs: [
      "Email privacy@evergreenwebsolutions.ca to request a copy of, correct, or delete your information.",
    ],
    bullets: [
      "Opt out of emails by replying to any Evergreen message.",
      "Clear cookies to reset RSVP session tracking.",
      "Contact us directly for privacy questions.",
    ],
  },
  contact: {
    heading: "Contact Us",
    paragraphs: [
      "Reach our privacy lead at privacy@evergreenwebsolutions.ca for questions or data requests.",
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
      throw new Error(`Failed to load policy (${response.status})`)
    }

    const policy = (await response.json()) as PrivacyPolicy
    return { policy, resolvedFrom: "remote" }
  } catch (error) {
    console.error("Failed to fetch remote privacy policy", error)
    return { policy: fallbackPolicy, resolvedFrom: "fallback" }
  }
}
