import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Removed: import { cn } from "@/lib/utils"; // No longer needed

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
      <body 
        className={`min-h-screen bg-brand-light font-sans antialiased ${inter.variable}`} // Simplified class combining
      >
        {children}
      </body>
    </html>
  );
}