// Server-only: imports node crypto and reads the auth secret.
import { createHmac, timingSafeEqual } from "crypto";
import type { Itinerary } from "@prisma/client";
import { undash } from "./text";

/**
 * Share links are signed rather than stored: the token is an HMAC of the
 * itinerary id, so anyone holding the link can view that one trip read-only,
 * and nobody can guess a link for another trip.
 */
const secret = () => {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is required to sign share links");
  return s;
};

export function shareToken(id: string) {
  return createHmac("sha256", secret()).update(`itinerary-share:${id}`).digest("base64url").slice(0, 32);
}

export function verifyShareToken(id: string, token: string | null) {
  if (!token) return false;
  const expected = Buffer.from(shareToken(id));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** The JSON shape the itinerary views render. */
export function toDetails(itinerary: Itinerary) {
  return {
    id: itinerary.id,
    destination: itinerary.destination,
    startDate: itinerary.startDate.toISOString(),
    endDate: itinerary.endDate.toISOString(),
    numberOfDays: itinerary.numberOfDays,
    budget: itinerary.budget,
    numberOfPeople: itinerary.numberOfPeople,
    tripType: itinerary.tripType,
    interests: JSON.parse(itinerary.interests),
    itineraryData: undash(JSON.parse(itinerary.itineraryData)),
    createdAt: itinerary.createdAt.toISOString(),
  };
}
