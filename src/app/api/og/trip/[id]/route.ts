import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderOgCard, siteCard, tripCard } from "@/lib/og";
import { toDetails, verifyShareToken } from "@/lib/share";

// A shared trip's link preview. Only a valid share token reveals the trip;
// anything else gets the site's own card.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let card = siteCard();
  if (verifyShareToken(id, request.nextUrl.searchParams.get("t"))) {
    try {
      const itinerary = await prisma.itinerary.findUnique({ where: { id } });
      if (itinerary) card = tripCard(toDetails(itinerary));
    } catch (error) {
      console.error("og trip:", error);
    }
  }
  const image = await renderOgCard(card);
  image.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return image;
}
