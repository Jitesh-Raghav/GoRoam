// Server-only: reads the session and the database.
import type { Itinerary } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

type Owned = { ok: true; email: string; name: string | null; userId: string; itinerary: Itinerary } | { ok: false; response: NextResponse };

const fail = (status: number, error: string): Owned => ({ ok: false, response: NextResponse.json({ success: false, error }, { status }) });

/** The signed-in traveller's own trip, or the error response to send instead. */
export async function ownedItinerary(id: string): Promise<Owned> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return fail(401, "Authentication required");
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!user) return fail(404, "User not found");
  const itinerary = await prisma.itinerary.findFirst({ where: { id, userId: user.id } });
  if (!itinerary) return fail(404, "Itinerary not found");
  return { ok: true, email, name: user.name, userId: user.id, itinerary };
}

/** A tiny per-key limiter for one server instance; enough to stop accidental hammering. */
export function limiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return false;
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.delete(hits.keys().next().value!);
    return true;
  };
}
