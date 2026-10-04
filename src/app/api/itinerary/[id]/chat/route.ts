import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { limiter, ownedItinerary } from '@/lib/owned-trip';
import { CHAT_LIMIT } from '@/lib/plans';
import { tripContext, takeAiRequest } from '@/lib/trip-context';

/**
 * The trip's AI concierge: answers follow-up questions with the whole plan in
 * mind. Capped per trip so one itinerary can't run up an unbounded bill.
 */

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const allow = limiter(8, 60_000);

type Msg = { role: 'user' | 'assistant'; content: string };

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedItinerary(id);
  if (!owned.ok) return owned.response;
  if (!openai) return NextResponse.json({ success: false, error: 'The concierge is not configured.' }, { status: 503 });
  if (!allow(owned.userId)) return NextResponse.json({ success: false, error: 'One moment, try again in a minute.' }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const messages: Msg[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m: Msg) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map((m: Msg) => ({ role: m.role, content: m.content.trim().slice(0, m.role === 'user' ? 800 : 2000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ success: false, error: 'Ask a question first.' }, { status: 400 });
  }

  // Take one question from the trip's allowance atomically.
  if (!(await takeAiRequest(id))) {
    return NextResponse.json({ success: false, error: `You've used all ${CHAT_LIMIT} AI requests on this trip.`, left: 0 }, { status: 429 });
  }
  const left = Math.max(CHAT_LIMIT - owned.itinerary.chatCount - 1, 0);

  const it = owned.itinerary;
  const context = tripContext(it.destination, it.startDate, it.numberOfDays, it.budget, JSON.parse(it.itineraryData));
  const refund = () => prisma.itinerary.update({ where: { id }, data: { chatCount: { decrement: 1 } } }).catch(() => {});

  let stream;
  try {
    stream = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        temperature: 0.5,
        max_tokens: 700,
        stream: true,
        messages: [
          {
            role: 'system',
            content: `You are GoRoam's travel concierge, chatting with a traveller about the trip below. Be warm, specific and brief: under 150 words unless they ask for detail. Refer to their actual days, stops and stays when relevant. Use short paragraphs or "- " bullet lines; no markdown headings, bold or tables. If something depends on live information (prices, opening hours, weather, visas), give your best guidance and say to double-check. Politely decline questions unrelated to travel. Never use em dashes; use commas, colons or full stops.\n\nTRIP\n${context}`,
          },
          ...messages,
        ],
      },
      { timeout: 30000 }
    );
  } catch (error) {
    console.error('Concierge error:', error instanceof Error ? error.message : error);
    await refund();
    return NextResponse.json({ success: false, error: "Couldn't reach the concierge just now." }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (error) {
        console.error('Concierge stream error:', error instanceof Error ? error.message : error);
        controller.enqueue(encoder.encode('\n\n(The answer was cut off. Please ask again.)'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body$, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Questions-Left': String(left) },
  });
}
