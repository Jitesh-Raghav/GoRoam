import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { limiter, ownedItinerary } from '@/lib/owned-trip';
import { shareToken } from '@/lib/share';
import { codeMatches, hashCode, maskPhone, newCode, normalizePhone, sendCode, whatsappConfigured } from '@/lib/whatsapp';

/**
 * Who gets this trip's day plan on WhatsApp each morning.
 *   GET                         → { configured, allowed, hour, link (the signed share link), subs: [{ id, phone (masked), name, verified }] }
 *   POST   { phone, name? }     → adds the number and sends it a 6-digit code
 *   PUT    { id, code }         → verifies it; messages start on the trip's first morning
 *   PATCH  { hour?, timezone? } → when to send (local hour) and the trip's time zone
 *   DELETE ?id=                 → stops messages to that number
 * Automatic messages come with the Explorer and Adventurer packs.
 */
const MAX_PER_TRIP = 8;
const allowAdd = limiter(6, 10 * 60_000);

async function allowed(userId: string) {
  if (process.env.GOROAM_WHATSAPP_FOR_ALL === '1') return true;
  const paid = await prisma.payment.findFirst({ where: { userId, status: 'succeeded', planId: { in: ['explorer', 'adventurer'] } }, select: { id: true } });
  return !!paid;
}

const view = (s: { id: string; phone: string; name: string | null; verified: boolean; stoppedAt: Date | null }) => ({ id: s.id, phone: maskPhone(s.phone), name: s.name, verified: s.verified, stopped: !!s.stoppedAt });

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  const subs = await prisma.whatsAppSub.findMany({ where: { itineraryId: id }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ success: true, configured: whatsappConfigured(), allowed: await allowed(owned.userId), hour: owned.itinerary.whatsappHour, link: `${request.nextUrl.origin}/trip/${id}?t=${shareToken(id)}`, subs: subs.map(view) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  if (!(await allowed(owned.userId))) return NextResponse.json({ success: false, error: 'Morning messages come with the Explorer and Adventurer packs.', upgrade: true }, { status: 402 });
  if (!whatsappConfigured()) return NextResponse.json({ success: false, error: "WhatsApp messages aren't switched on yet. Use Send to WhatsApp for now." }, { status: 503 });
  if (!allowAdd(owned.userId)) return NextResponse.json({ success: false, error: 'One moment, try again in a few minutes.' }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(body.phone);
  if (!phone) return NextResponse.json({ success: false, error: 'Enter the full number with its country code, like +91 98765 43210.' }, { status: 400 });
  const name = typeof body.name === 'string' ? body.name.replace(/\s+/g, ' ').trim().slice(0, 40) || null : null;
  const count = await prisma.whatsAppSub.count({ where: { itineraryId: id } });
  const existing = await prisma.whatsAppSub.findUnique({ where: { itineraryId_phone: { itineraryId: id, phone } } });
  if (!existing && count >= MAX_PER_TRIP) return NextResponse.json({ success: false, error: `Up to ${MAX_PER_TRIP} numbers per trip.` }, { status: 400 });

  const code = newCode();
  const sub = await prisma.whatsAppSub.upsert({
    where: { itineraryId_phone: { itineraryId: id, phone } },
    create: { itineraryId: id, phone, name, codeHash: hashCode(code, phone), codeExpires: new Date(Date.now() + 10 * 60_000) },
    update: { name: name ?? undefined, codeHash: hashCode(code, phone), codeExpires: new Date(Date.now() + 10 * 60_000), attempts: 0, stoppedAt: null },
  });
  try {
    await sendCode(phone, code);
  } catch (error) {
    console.error('whatsapp code:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: "We couldn't send a code to that number on WhatsApp. Check it and try again." }, { status: 502 });
  }
  return NextResponse.json({ success: true, sub: view(sub) });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  const body = await request.json().catch(() => ({}));
  const sub = await prisma.whatsAppSub.findFirst({ where: { id: String(body.id ?? ''), itineraryId: id } });
  if (!sub) return NextResponse.json({ success: false, error: 'Number not found.' }, { status: 404 });
  if (sub.attempts >= 5 || !sub.codeExpires || sub.codeExpires < new Date()) {
    return NextResponse.json({ success: false, error: 'That code has expired. Send a new one.' }, { status: 400 });
  }
  if (!codeMatches(String(body.code ?? '').trim(), sub.phone, sub.codeHash)) {
    await prisma.whatsAppSub.update({ where: { id: sub.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ success: false, error: "That code doesn't match." }, { status: 400 });
  }
  const done = await prisma.whatsAppSub.update({ where: { id: sub.id }, data: { verified: true, optedInAt: new Date(), codeHash: null, codeExpires: null, stoppedAt: null } });
  return NextResponse.json({ success: true, sub: view(done) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  const body = await request.json().catch(() => ({}));
  const data: { whatsappHour?: number; timezone?: string } = {};
  const hour = Math.round(Number(body.hour));
  if (Number.isInteger(hour) && hour >= 5 && hour <= 11) data.whatsappHour = hour;
  if (typeof body.timezone === 'string' && body.timezone.length < 60) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: body.timezone });
      data.timezone = body.timezone;
    } catch {
      /* not a real zone */
    }
  }
  await prisma.itinerary.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  await prisma.whatsAppSub.deleteMany({ where: { id: request.nextUrl.searchParams.get('id') ?? '', itineraryId: id } });
  return NextResponse.json({ success: true });
}
