// Server-only: safe read-modify-write of a trip's itinerary data.
import { prisma } from '@/lib/prisma';
import type { ItineraryData } from '@/lib/trip';

/**
 * Changes a trip's stored data under a row lock, so background writers (days
 * being written, photos, the guide) and the traveller's own edits never
 * overwrite each other. `change` may return extra columns to set.
 */
export async function mutateTrip(
  id: string,
  change: (data: ItineraryData) => void | { status?: string },
): Promise<ItineraryData | null> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Itinerary" WHERE id = ${id} FOR UPDATE`;
    const row = await tx.itinerary.findUnique({ where: { id }, select: { itineraryData: true } });
    if (!row) return null;
    const data = JSON.parse(row.itineraryData) as ItineraryData;
    const extra = change(data) || {};
    await tx.itinerary.update({ where: { id }, data: { itineraryData: JSON.stringify(data), ...extra } });
    return data;
  }, { timeout: 15000 });
}
