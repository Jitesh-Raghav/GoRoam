import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoRoam - AI-Powered Travel Itinerary Planning",
  description: "Plan your perfect trip with AI-powered itineraries. Get personalized travel plans, real-time maps, and downloadable PDFs in seconds.",
  keywords: ["travel planning", "AI itinerary", "trip planner", "travel app", "vacation planning"],
  authors: [{ name: "GoRoam Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "GoRoam - AI-Powered Travel Planning",
    description: "Create perfect travel itineraries with AI in minutes, not hours.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "GoRoam - AI Travel Planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoRoam - AI Travel Planning",
    description: "Plan amazing trips with AI-powered itineraries",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
