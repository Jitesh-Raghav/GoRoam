// Server-only helpers shared by the trip's AI features (concierge, swaps).
import { isoDay } from './booking';
import { CHAT_LIMIT } from './plans';
import { prisma } from './prisma';
import { COMPANIONS, PACES, SPEND, STAYS, labelFor, type ItineraryData } from './trip';

/** The trip, compactly, for a model's system prompt. */
export function tripContext(destination: string, start: Date, days: number, budget: number, data: ItineraryData) {
  const p = data.trip?.preferences;
  const lines = [
    `Destination: ${data.summary?.destination || destination}`,
    `Dates: ${isoDay(start.toISOString(), 0)} to ${isoDay(start.toISOString(), days - 1)} (${days} days)`,
    `Travelling from: ${data.trip?.source || 'not given'}`,
    `Budget: $${Math.round(budget)} USD total`,
  ];
  if (p) {
    lines.push(
      `Party: ${labelFor(COMPANIONS, p.companions)}, ${p.adults} adult(s)${p.children ? `, ${p.children} child(ren)` : ''}`,
      `Style: ${labelFor(PACES, p.pace)} pace, ${labelFor(SPEND, p.spend)} spending, ${labelFor(STAYS, p.stay)} stay`
    );
    if (p.diet.length) lines.push(`Diet: ${p.diet.join(', ')}`);
    if (p.notes) lines.push(`Their notes: ${p.notes}`);
  }
  (data.itinerary ?? []).forEach((d, i) => {
    const stops = (['morning', 'afternoon', 'evening'] as const)
      .map((k) => d[k]?.place?.name && `${k}: ${d[k].place.name}${d[k].place.area ? ` (${d[k].place.area})` : ''}`)
      .filter(Boolean)
      .join('; ');
    lines.push(`Day ${i + 1} (${isoDay(start.toISOString(), i)}) "${d.theme ?? ''}": ${stops}`);
  });
  if (data.stays?.length) lines.push(`Suggested stays: ${data.stays.map((s) => `${s.name} (${s.area})`).join('; ')}`);
  return lines.join('\n');
}

/**
 * Takes one of the trip's AI requests (questions or swaps share the allowance),
 * atomically, so parallel calls can't overspend. False when none are left.
 */
export async function takeAiRequest(id: string) {
  const took = await prisma.itinerary.updateMany({ where: { id, chatCount: { lt: CHAT_LIMIT } }, data: { chatCount: { increment: 1 } } });
  return took.count > 0;
}

/** Hands a request back when the model call failed. */
export const refundAiRequest = (id: string) => prisma.itinerary.update({ where: { id }, data: { chatCount: { decrement: 1 } } }).catch(() => {});
