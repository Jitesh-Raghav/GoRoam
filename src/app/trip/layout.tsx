import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "A trip shared with you · GoRoam",
  description: "A day-by-day travel plan made with GoRoam.",
  // Shared links are private-by-obscurity; keep them out of search results.
  robots: { index: false, follow: false },
};

export default function TripLayout({ children }: { children: ReactNode }) {
  return children;
}
