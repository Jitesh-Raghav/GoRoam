import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/session-provider";
import { OfflineSupport } from "@/components/site/offline";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headlines: a tight, confident grotesque.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL?.startsWith("http") ? process.env.NEXTAUTH_URL : "https://goroam.world"),
  title: "GoRoam - AI-Powered Travel Itinerary Planning",
  description: "Plan your perfect trip with AI-powered itineraries. Get personalized travel plans, real-time maps, and downloadable PDFs in seconds.",
  keywords: ["travel planning", "AI itinerary", "trip planner", "travel app", "vacation planning"],
  authors: [{ name: "GoRoam Team" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "GoRoam - AI-Powered Travel Planning",
    description: "Create perfect travel itineraries with AI in minutes, not hours.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoRoam - AI Travel Planning",
    description: "Plan amazing trips with AI-powered itineraries",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f8f9",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <OfflineSupport />
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
