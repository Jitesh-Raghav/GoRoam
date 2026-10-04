import { NextRequest, NextResponse } from 'next/server';
import { itineraryEmail } from '@/lib/email/itinerary-email';
import { buildIcs } from '@/lib/ics';
import { limiter, ownedItinerary } from '@/lib/owned-trip';
import { shareToken, toDetails } from '@/lib/share';
import type { ItineraryDetails } from '@/lib/trip';

/**
 * Emails the trip to its owner (and only its owner, so it can't be used to
 * send mail to strangers), with a calendar file of every stop attached.
 * Needs RESEND_API_KEY and EMAIL_FROM, e.g. "GoRoam <trips@yourdomain.com>".
 */

const allow = limiter(3, 60_000);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;

  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) {
    return NextResponse.json({ success: false, error: "Email isn't set up yet — download the PDF instead." }, { status: 503 });
  }
  if (!allow(owned.userId)) {
    return NextResponse.json({ success: false, error: 'Easy there — try again in a minute.' }, { status: 429 });
  }

  try {
    const it = toDetails(owned.itinerary) as ItineraryDetails;
    const link = `${request.nextUrl.origin}/trip/${it.id}?t=${shareToken(it.id)}`;
    const { subject, html, text } = itineraryEmail(it, link, owned.name);
    const slug = it.destination.split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'trip';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [owned.email],
        subject,
        html,
        text,
        attachments: [{ filename: `${slug}-goroam.ics`, content: Buffer.from(buildIcs(it)).toString('base64') }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ success: false, error: "Couldn't send the email just now." }, { status: 502 });
    }
    return NextResponse.json({ success: true, data: { to: owned.email } });
  } catch (error) {
    console.error('Error emailing itinerary:', error);
    return NextResponse.json({ success: false, error: "Couldn't send the email just now." }, { status: 500 });
  }
}
