import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import SiteAnalytics from '@/components/SiteAnalytics'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI & Business in the North — RSVP",
  description: "RSVP for the AI & Business in the North event.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-brand-light font-sans antialiased ${inter.variable}`}>
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
