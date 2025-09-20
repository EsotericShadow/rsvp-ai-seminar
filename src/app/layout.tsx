import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import SiteAnalytics from '@/components/SiteAnalytics'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI & Business in the North — RSVP",
  description: "RSVP for the AI & Business in the North event.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-white font-sans antialiased ${inter.variable}`}>
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
