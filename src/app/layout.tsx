import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/admin-ui-fixes.css";

import SiteAnalytics from '@/components/SiteAnalytics'
import StructuredData from '@/components/StructuredData'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://rsvp.evergreenwebsolutions.ca"),
  title: {
    default: "AI Agents, Machine Learning & Custom AI Integrations in Terrace, BC | Evergreen Web Solutions",
    template: `%s | Evergreen Web Solutions`,
  },
  description:
    "Evergreen Web Solutions specializes in AI, Machine Learning, Deep Learning, and AI automation in Terrace and Northwest BC. We provide AI Agents, Custom AI Integrations, RAG systems, and help businesses in mining, forestry, construction, tourism, retail, hospitality, logistics, clean energy, and local government leverage Artificial Intelligence for growth.",
  keywords: [
    // Core AI Terms
    "AI",
    "Artificial Intelligence", 
    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "GenAI",
    "Retrieval-Augmented Generation",
    "RAG",
    "Model Context Protocol",
    "MCP",
    "Multi-modal",
    "MM",
    "Agentic AI",
    "AI Agents",
    "Custom AI Integrations",
    "Linear Regression",
    "AI Automation",
    
    // Geographic Terms
    "Terrace BC",
    "Northwest BC",
    "Kitimat",
    "Prince Rupert", 
    "Smithers",
    "Northern BC",
    "BC Interior",
    "Peace Region",
    "Cariboo",
    "Kootenays",
    "Okanagan",
    
    // Business & Service Terms
    "Business AI",
    "AI Consulting",
    "AI Services",
    "AI for small business",
    "AI for enterprise",
    "automation solutions",
    "digital strategy",
    "AI implementation",
    "AI training",
    "AI support",
    
    // Industry-Specific Terms
    "mining automation",
    "forestry AI",
    "construction AI", 
    "tourism technology",
    "hospitality AI",
    "retail automation",
    "logistics AI",
    "clean energy AI",
    "local government AI",
    "healthcare AI",
    "education technology",
    "agriculture AI",
    "manufacturing AI",
    "real estate AI",
    "financial services AI",
    "transportation AI",
    "energy sector AI",
    "utilities AI",
    
    // Technical Terms
    "neural networks",
    "computer vision",
    "natural language processing",
    "NLP",
    "predictive analytics",
    "data science",
    "big data",
    "cloud AI",
    "edge AI",
    "AI infrastructure",
    "AI deployment",
    "AI monitoring",
    "AI optimization",
    
    // Company Terms
    "Evergreen Web Solutions",
    "Gabriel Lacroix",
    "Northern BC AI",
    "Terrace AI company",
  ],
  openGraph: {
    title: "AI & AI Automation Solutions for Terrace & Northwest BC | Evergreen Web Solutions",
    description: "Transform your business with AI, Machine Learning, and automation. Serving Terrace, Kitimat, Prince Rupert, and all of Northwest BC.",
    url: "https://rsvp.evergreenwebsolutions.ca",
    siteName: "Evergreen Web Solutions",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI & AI Automation Solutions for Terrace & Northwest BC",
    description: "Transform your business with AI, Machine Learning, and automation. Serving Terrace, Kitimat, Prince Rupert, and all of Northwest BC.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://rsvp.evergreenwebsolutions.ca",
  },
  other: {
    "theme-color": "#10b981",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "AI Event RSVP",
    "msapplication-TileColor": "#10b981",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`min-h-screen bg-white font-sans antialiased ${inter.variable}`}>
        <ThemeProvider>
          {children}
          <SiteAnalytics />
          <StructuredData type="organization" />
        </ThemeProvider>
      </body>
    </html>
  );
}
