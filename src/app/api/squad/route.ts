import { randomInt } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { clientIp, hashIp } from '@/lib/guest';
import { logIfSchemaOutOfSync, prisma } from '@/lib/prisma';

// Codes people can read out loud: no 0/O, 1/I/L.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
const PER_IP_A_DAY = 15;

/** Start a Squad Match: a name for the trip in, a share code out. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').trim().replace(/\s+/g, ' ').slice(0, 60) || 'Our next trip';
  const ipHash = hashIp(clientIp(request));
  try {
    const recent = await prisma.squad.count({ where: { ipHash, createdAt: { gte: new Date(Date.now() - 86400000) } } });
    if (recent >= PER_IP_A_DAY) return NextResponse.json({ success: false, error: 'That is a lot of squads for one day. Try again tomorrow.' }, { status: 429 });
    for (let i = 0; i < 4; i++) {
      const code = newCode();
      const taken = await prisma.squad.findUnique({ where: { code }, select: { id: true } });
      if (taken) continue;
      await prisma.squad.create({ data: { code, name, ipHash } });
      return NextResponse.json({ success: true, code });
    }
    return NextResponse.json({ success: false, error: 'Could not make a code. Try again.' }, { status: 500 });
  } catch (error) {
    logIfSchemaOutOfSync(error, 'squad');
    console.error('[squad] create failed', error);
    return NextResponse.json({ success: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
