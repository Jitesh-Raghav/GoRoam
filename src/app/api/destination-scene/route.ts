import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '@/lib/auth';
import { isLandscape, sceneForDestination, sceneIsCertain, type Landscape } from '@/lib/destinations';

/**
 * The poster scene for any destination. Keywords settle wonders and well-known
 * landscapes; anything else is classified once by a small model and cached, so
 * "Shillong" gets rainy green hills rather than India's Taj Mahal.
 */

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const cache = new Map<string, Landscape | null>();
const MAX_CACHE = 2000;

async function classify(destination: string): Promise<Landscape | null> {
  if (!openai) return null;
  const completion = await openai.chat.completions.create(
    {
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 5,
      messages: [
        {
          role: 'system',
          content:
            'Classify what a travel destination looks like. Reply with exactly one word: ' +
            'coast (beaches, islands, seaside), mountains (high rocky or snowy peaks), hills (lush green, often rainy hill country or rainforest), ' +
            'lake (known for a lake or backwaters), desert (sand, dunes, arid), snow (arctic, polar, northern lights), ' +
            'city (urban, no dominant landscape).',
        },
        { role: 'user', content: destination },
      ],
    },
    { timeout: 8000 }
  );
  const word = completion.choices[0]?.message?.content?.trim().toLowerCase().replace(/[^a-z]/g, '');
  return isLandscape(word) ? word : null;
}

export async function GET(request: NextRequest) {
  const destination = (request.nextUrl.searchParams.get('q') ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (!destination) return NextResponse.json({ scene: sceneForDestination('') });

  if (sceneIsCertain(destination)) return NextResponse.json({ scene: sceneForDestination(destination) });

  // Classifying costs a model call, so only signed-in travellers get it.
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ scene: sceneForDestination(destination) });

  const key = destination.toLowerCase();
  let landscape = cache.get(key);
  if (landscape === undefined) {
    try {
      landscape = await classify(destination);
      if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
      cache.set(key, landscape);
    } catch (error) {
      console.error('destination-scene:', error instanceof Error ? error.message : error);
      landscape = null;
    }
  }

  return NextResponse.json(
    { scene: sceneForDestination(destination, landscape), landscape },
    { headers: { 'Cache-Control': 'private, max-age=86400' } }
  );
}
