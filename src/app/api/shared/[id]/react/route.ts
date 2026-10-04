import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { limiter } from '@/lib/owned-trip';
import { verifyShareToken } from '@/lib/share';
import { undashText } from '@/lib/text';
import { reactionKey, type ItineraryData, type StopReaction } from '@/lib/trip';

/**
 * Friends with a share link vote on stops (and can leave a short note), so the
 * trip's owner sees what the group thinks. The signed share token is the key.
 */

const allow = limiter(20, 60_000);
const SLOTS = ['morning', 'afternoon', 'evening'];
const MAX_NOTES = 20;
const MAX_VOTES = 500;
const str = (v: unknown, max: number) => (typeof v === 'string' ? undashText(v.replace(/\s+/g, ' ').trim()).slice(0, max) : '');

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!verifyShareToken(id, request.nextUrl.searchParams.get('t'))) {
    return NextResponse.json({ success: false, error: 'This share link is invalid.' }, { status: 404 });
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (!allow(`${ip}:${id}`)) return NextResponse.json({ success: false, error: 'Easy there, try again in a minute.' }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const day = Math.round(Number(body.day));
  const slot = String(body.slot);
  const vote = body.vote === 'up' || body.vote === 'down' ? body.vote : null;
  const text = str(body.text, 200);
  const name = str(body.name, 30) || 'A friend';
  if (!Number.isInteger(day) || day < 0 || !SLOTS.includes(slot) || !vote) {
    return NextResponse.json({ success: false, error: 'Pick a stop and a vote.' }, { status: 400 });
  }

  const row = await prisma.itinerary.findUnique({ where: { id }, select: { itineraryData: true } });
  if (!row) return NextResponse.json({ success: false, error: 'This trip is no longer available.' }, { status: 404 });
  const data = JSON.parse(row.itineraryData) as ItineraryData;
  if (!data.itinerary?.[day]?.[slot as 'morning']?.place?.name) {
    return NextResponse.json({ success: false, error: 'That stop is not in the plan.' }, { status: 400 });
  }

  const reactions = data.reactions ?? {};
  const total = Object.values(reactions).reduce((s, r) => s + r.up + r.down, 0);
  if (total >= MAX_VOTES) return NextResponse.json({ success: false, error: 'This trip has had all the votes it can take.' }, { status: 429 });

  const key = reactionKey(day, slot);
  const current: StopReaction = reactions[key] ?? { up: 0, down: 0, notes: [] };
  const next: StopReaction = {
    up: current.up + (vote === 'up' ? 1 : 0),
    down: current.down + (vote === 'down' ? 1 : 0),
    notes: text ? [...current.notes, { name, text, vote, at: new Date().toISOString() }].slice(-MAX_NOTES) : current.notes,
  };
  data.reactions = { ...reactions, [key]: next };
  await prisma.itinerary.update({ where: { id }, data: { itineraryData: JSON.stringify(data) } });
  return NextResponse.json({ success: true, key, reaction: next });
}
