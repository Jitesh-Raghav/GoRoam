import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/session-provider";
import { OfflineSupport } from "@/components/site/offline";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Headlines: Space Grotesk. Body and UI: Inter. Times, coordinates and other data: Geist Mono.
// `subsets` only picks what to preload: every subset is still declared, so a ₹ (latin-ext)
// downloads its few kilobytes on the pages that show one instead of on every page.
const display = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Rarely above the fold, so it isn't worth a preload.
const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

// Search Console's token. Accepts just the content value or the whole <meta> tag pasted from Google,
// with or without quotes, so a copy-paste slip can't break verification.
const googleVerification = (() => {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  if (!raw) return undefined;
  const fromTag = raw.match(/content\s*=\s*["']([^"']+)["']/i)?.[1];
  return (fromTag ?? raw).replace(/^["']|["']$/g, "").trim() || undefined;
})();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL?.startsWith("http") ? process.env.NEXTAUTH_URL : "https://goroam.world"),
  title: {
    default: "GoRoam: AI Trip Planner for Day-by-Day Itineraries",
    template: "%s · GoRoam",
  },
  description:
    "Describe your trip in one sentence and GoRoam's AI trip planner builds a day-by-day itinerary with real places, timings, an honest budget and a local guide. Your first trip is free.",
  keywords: ["AI trip planner", "AI itinerary generator", "travel itinerary planner", "trip planner India", "day by day itinerary"],
  authors: [{ name: "Jitesh Raghav", url: "https://jiteshraghav.xyz" }],
  creator: "Jitesh Raghav",
  alternates: { canonical: "/" },
  // Google Search Console: set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the "HTML tag" content value.
  verification: googleVerification ? { google: googleVerification } : undefined,
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
    title: "GoRoam: AI Trip Planner for Day-by-Day Itineraries",
    description: "One sentence in, a whole trip out: real places, honest budgets and a guide for the road. First trip free.",
    type: "website",
    siteName: "GoRoam",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoRoam: AI Trip Planner",
    description: "One sentence in, a whole trip out. First trip free.",
    creator: "@okayjitesh",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
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
        className={`${display.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <OfflineSupport />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
