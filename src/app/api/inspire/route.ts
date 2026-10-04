import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '@/lib/auth';
import { isLandscape } from '@/lib/destinations';
import { limiter } from '@/lib/owned-trip';
import { undash } from '@/lib/text';
import { COMPANIONS, VIBES, labelFor } from '@/lib/trip';

/**
 * "Not sure where to go?" Four destinations that fit the month, budget, company and
 * vibe, each with why now, rough cost, flight time and weather. Free (no credit),
 * for signed-in travellers, with a per-minute and a daily cap.
 */

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const perMinute = limiter(6, 60_000);
const daily = new Map<string, { day: string; n: number }>();
const DAILY_LIMIT = 20;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export interface Idea {
  destination: string;
  why: string;
  cost: number;
  flightTime?: string;
  weather?: string;
  bestFor: string[];
  landscape?: string;
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ success: false, error: 'Sign in to get ideas.' }, { status: 401 });
  if (!openai) return NextResponse.json({ success: false, error: 'Ideas are not configured.' }, { status: 503 });
  if (!perMinute(email)) return NextResponse.json({ success: false, error: 'One moment, try again in a minute.' }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const month = Math.round(Number(body.month));
  const budget = Math.round(Number(body.budget));
  const days = Math.max(2, Math.min(30, Math.round(Number(body.days)) || 7));
  const from = str(body.from, 80);
  const companions = labelFor(COMPANIONS, String(body.companions ?? 'couple'));
  const vibes = (Array.isArray(body.vibes) ? body.vibes : []).filter((v: unknown) => VIBES.some((x) => x.id === v)).slice(0, 5).map((v: string) => labelFor(VIBES, v));
  const exclude = (Array.isArray(body.exclude) ? body.exclude : []).map((x: unknown) => str(x, 60)).filter(Boolean).slice(0, 12);
  if (!(month >= 1 && month <= 12) || !(budget >= 100 && budget <= 200000)) {
    return NextResponse.json({ success: false, error: 'Pick a month and a budget.' }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const used = daily.get(email);
  const n = used?.day === today ? used.n : 0;
  if (n >= DAILY_LIMIT) return NextResponse.json({ success: false, error: "That's plenty of inspiration for today. Try again tomorrow." }, { status: 429 });
  daily.set(email, { day: today, n: n + 1 });

  const prompt = `Suggest 4 travel destinations for a ${days}-day trip in ${MONTHS[month - 1]} for ${companions.toLowerCase()} travelling from ${from || 'somewhere unspecified'}, with a total budget of about $${budget} USD including flights.
They love: ${vibes.join(', ') || 'a bit of everything'}.
${exclude.length ? `Don't suggest: ${exclude.join(', ')}.` : ''}

RULES
- Real destinations (a city or region, with its country) that are genuinely at their best in ${MONTHS[month - 1]}: good weather, festivals, seasonal highlights. Avoid monsoon, hurricane or extreme-heat seasons.
- A spread: at least one less-obvious pick, and at least one reachable without a very long flight from where they live.
- "cost" is a realistic total USD estimate for the whole party including return flights, roughly within budget.
- "flightTime" is the typical flying time from their home city (e.g. "4h direct", "11h, 1 stop").
- "weather" is one short phrase for that month (e.g. "22°C, dry and sunny").
- "why" is one vivid sentence on why this month, in second person.
- "bestFor" is 3 short tags.
- "landscape" is one of: coast, mountains, hills, lake, desert, snow, city.
- Never use em dashes.

Respond with JSON only:
{ "ideas": [ { "destination": "City, Country", "why": "", "cost": 0, "flightTime": "", "weather": "", "bestFor": ["", "", ""], "landscape": "city" } ] }`;

  try {
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        temperature: 0.9,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a well-travelled destination expert who knows the best time to visit everywhere. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
      },
      { timeout: 30000 }
    );
    const parsed = undash(JSON.parse(completion.choices[0]?.message?.content || '{}'));
    const ideas: Idea[] = (Array.isArray(parsed.ideas) ? parsed.ideas : [])
      .map((i: Record<string, unknown>) => ({
        destination: str(i.destination, 80),
        why: str(i.why, 280),
        cost: Math.max(0, Math.round(Number(i.cost)) || 0),
        flightTime: str(i.flightTime, 40) || undefined,
        weather: str(i.weather, 60) || undefined,
        bestFor: (Array.isArray(i.bestFor) ? i.bestFor : []).map((t: unknown) => str(t, 24)).filter(Boolean).slice(0, 3),
        landscape: isLandscape(i.landscape) ? (i.landscape as string) : undefined,
      }))
      .filter((i: Idea) => i.destination && i.why)
      .slice(0, 4);
    if (!ideas.length) throw new Error('No ideas');
    return NextResponse.json({ success: true, ideas, left: DAILY_LIMIT - n - 1 });
  } catch (error) {
    console.error('Inspire failed:', error instanceof Error ? error.message : error);
    daily.set(email, { day: today, n });
    return NextResponse.json({ success: false, error: "Couldn't find ideas just now." }, { status: 502 });
  }
}
