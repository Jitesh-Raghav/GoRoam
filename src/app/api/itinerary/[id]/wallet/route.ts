import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ownedItinerary } from '@/lib/owned-trip';
import { EXPENSE_CATEGORIES, type ExpenseCategory, type ItineraryData, type Wallet } from '@/lib/trip';

/** Saves the trip wallet (owner only). The whole wallet is sent each time; it's small. */

const MAX_PEOPLE = 16;
const MAX_EXPENSES = 300;
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const id = (v: unknown) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : null);

/** Validates a wallet from the client; null if it isn't one. */
function cleanWallet(raw: unknown): Wallet | null {
  if (!raw || typeof raw !== 'object') return null;
  const w = raw as Record<string, unknown>;
  const currency = typeof w.currency === 'string' && /^[A-Z]{3}$/.test(w.currency) ? w.currency : 'USD';
  const people = (Array.isArray(w.people) ? w.people : [])
    .map((p) => ({ id: id(p?.id), name: str(p?.name, 40) }))
    .filter((p): p is { id: string; name: string } => !!p.id && !!p.name)
    .slice(0, MAX_PEOPLE);
  const ids = new Set(people.map((p) => p.id));
  if (ids.size !== people.length) return null;
  const expenses = (Array.isArray(w.expenses) ? w.expenses : [])
    .map((e) => {
      const amount = Math.round(Number(e?.amount) * 100) / 100;
      const split = (Array.isArray(e?.split) ? e.split : []).filter((s: unknown) => typeof s === 'string' && ids.has(s));
      return {
        id: id(e?.id),
        title: str(e?.title, 80),
        amount,
        paidBy: typeof e?.paidBy === 'string' && ids.has(e.paidBy) ? e.paidBy : null,
        split: [...new Set<string>(split)],
        category: (EXPENSE_CATEGORIES as readonly string[]).includes(e?.category) ? (e.category as ExpenseCategory) : 'other',
        date: typeof e?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : new Date().toISOString().slice(0, 10),
      };
    })
    .filter((e) => e.id && e.title && Number.isFinite(e.amount) && e.amount > 0 && e.amount < 10_000_000 && e.paidBy && e.split.length)
    .slice(0, MAX_EXPENSES);
  return { currency, people, expenses: expenses as Wallet['expenses'] };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = await params;
  const owned = await ownedItinerary(tripId);
  if (!owned.ok) return owned.response;

  const body = await request.json().catch(() => null);
  const wallet = cleanWallet(body?.wallet);
  if (!wallet) return NextResponse.json({ success: false, error: 'That wallet could not be saved.' }, { status: 400 });

  // Re-read the freshest copy so a concurrent change (photos, a swap) isn't lost.
  const fresh = await prisma.itinerary.findUnique({ where: { id: tripId }, select: { itineraryData: true } });
  if (!fresh) return NextResponse.json({ success: false, error: 'Itinerary not found' }, { status: 404 });
  const data = JSON.parse(fresh.itineraryData) as ItineraryData;
  data.wallet = wallet;
  await prisma.itinerary.update({ where: { id: tripId }, data: { itineraryData: JSON.stringify(data) } });
  return NextResponse.json({ success: true, wallet });
}
