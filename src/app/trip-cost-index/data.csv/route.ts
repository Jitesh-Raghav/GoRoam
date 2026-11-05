import { indexCsv } from "@/lib/trip-index";

// Built from the trip data at build time; a new deploy refreshes it.
export const dynamic = "force-static";

/** The whole Trip Cost Index as a CSV, free to reuse under CC BY 4.0 with a link back. */
export function GET() {
  return new Response(`${indexCsv()}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="goroam-trip-cost-index-2026.csv"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
