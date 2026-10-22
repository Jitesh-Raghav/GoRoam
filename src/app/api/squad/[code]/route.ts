import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { logIfSchemaOutOfSync, prisma } from '@/lib/prisma';
import { SQUAD_MAX, USD_TO_INR, VIBE_IDS, squadDeck, squadWeekends } from '@/lib/squad-match';

const clean = (v: unknown, max: number) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const pickFrom = (v: unknown, allowed: string[]) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && allowed.includes(x)))] : []);

/**
 * Join a squad, or change your answers: the browser's token says which member it is.
 * The budget is stored but never returned; the reply is only the token.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const squad = await prisma.squad.findUnique({ where: { code: code.toUpperCase() }, include: { _count: { select: { members: true } } } });
    if (!squad) return NextResponse.json({ success: false, error: 'This squad link has expired or never existed.' }, { status: 404 });

    const name = clean(body.name, 30);
    const homeCity = clean(body.homeCity, 80);
    const amount = Number(body.budget);
    if (!name) return NextResponse.json({ success: false, error: 'Add your name so your friends know it is you.' }, { status: 400 });
    if (!homeCity) return NextResponse.json({ success: false, error: 'Where are you travelling from?' }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ success: false, error: 'Set your budget.' }, { status: 400 });

    const slugs = squadDeck(squad.code, squad.createdAt).map((t) => t.slug);
    const likes = pickFrom(body.likes, slugs);
    const data = {
      name,
      homeCity,
      maxBudget: Math.min(amount * (body.currency === 'USD' ? USD_TO_INR : 1), 5_000_000),
      dates: JSON.stringify(pickFrom(body.dates, squadWeekends(squad.createdAt))),
      likes: JSON.stringify(likes),
      passes: JSON.stringify(pickFrom(body.passes, slugs).filter((s) => !likes.includes(s))),
      vibes: JSON.stringify(pickFrom(body.vibes, VIBE_IDS)),
    };

    const token = typeof body.token === 'string' ? body.token : '';
    const mine = token ? await prisma.squadMember.findUnique({ where: { token }, select: { id: true, squadId: true } }) : null;
    if (mine && mine.squadId === squad.id) {
      await prisma.squadMember.update({ where: { id: mine.id }, data });
      return NextResponse.json({ success: true, token });
    }
    if (squad._count.members >= SQUAD_MAX) return NextResponse.json({ success: false, error: `This squad is full (${SQUAD_MAX} people).` }, { status: 409 });
    const fresh = randomBytes(18).toString('base64url');
    await prisma.squadMember.create({ data: { ...data, token: fresh, squadId: squad.id } });
    return NextResponse.json({ success: true, token: fresh });
  } catch (error) {
    logIfSchemaOutOfSync(error, 'squad-join');
    console.error('[squad] join failed', error);
    return NextResponse.json({ success: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
