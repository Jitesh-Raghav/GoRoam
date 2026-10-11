import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * WhatsApp webhook (Meta → WhatsApp → Configuration).
 *   GET   Meta's verification handshake, using WHATSAPP_VERIFY_TOKEN.
 *   POST  incoming messages: "STOP" (or "unsubscribe") stops every trip's
 *         morning messages to that number; "START" turns them back on.
 * With WHATSAPP_APP_SECRET set, the request signature is checked.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && q.get('hub.mode') === 'subscribe' && q.get('hub.verify_token') === token) {
    return new NextResponse(q.get('hub.challenge') ?? '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (appSecret) {
    const given = Buffer.from(request.headers.get('x-hub-signature-256') ?? '');
    const expected = Buffer.from(`sha256=${createHmac('sha256', appSecret).update(raw).digest('hex')}`);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return new NextResponse('Bad signature', { status: 401 });
  }
  let body: { entry?: { changes?: { value?: { messages?: { from?: string; type?: string; text?: { body?: string }; button?: { text?: string } }[] } }[] }[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const m of change.value?.messages ?? []) {
        const phone = (m.from ?? '').replace(/\D/g, '');
        const text = (m.text?.body ?? m.button?.text ?? '').trim().toLowerCase();
        if (!phone || !text) continue;
        if (/^(stop|unsubscribe|cancel|band karo)\b/.test(text)) {
          await prisma.whatsAppSub.updateMany({ where: { phone, stoppedAt: null }, data: { stoppedAt: new Date() } });
        } else if (/^(start|resume)\b/.test(text)) {
          await prisma.whatsAppSub.updateMany({ where: { phone, verified: true }, data: { stoppedAt: null } });
        }
      }
    }
  }
  // Always 200, so Meta doesn't retry messages we don't act on.
  return NextResponse.json({ ok: true });
}
