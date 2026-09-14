import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/chrome";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Campus Connect — events, clubs, teammates & notes for your campus",
    template: "%s · Campus Connect",
  },
  description:
    "Campus Connect is a full-stack student platform: post campus events, join clubs, find project teammates, share study notes and ask questions. Built with Next.js, TypeScript, Tailwind CSS and Supabase.",
  keywords: ["campus", "college", "students", "events", "clubs", "study notes", "teammates", "Next.js", "Supabase"],
  openGraph: {
    title: "Campus Connect",
    description:
      "Post events, join clubs, find teammates, share notes and ask questions — built with Next.js, TypeScript, Tailwind CSS and Supabase.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
