import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import {
  COMPANIONS,
  DIETS,
  OCCASIONS,
  PACES,
  SPEND,
  STAYS,
  TRANSPORT,
  VIBES,
  normalizePreferences,
  titleCase,
  type ItineraryData,
  type Option,
  type TripPreferences,
} from '@/lib/trip';
import { FREE_CREDITS } from '@/lib/plans';
import { isLandscape } from '@/lib/destinations';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ItineraryRequest {
  source: string;
  destination: string;
  startDate: string;
  numberOfDays: number;
  budget: number;
  numberOfPeople: number;
  tripType: string;
  interests: string[];
  preferences?: unknown;
}

interface ItineraryResponse {
  success: boolean;
  data?: {
    itineraryId: string;
    itinerary: ItineraryData['itinerary'];
    summary: ItineraryData['summary'];
    creditsRemaining: number;
  };
  error?: string;
}

// Rate limiting function
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute
    return true;
  }
  
  if (userLimit.count >= 5) { // 5 requests per minute
    return false;
  }
  
  userLimit.count++;
  return true;
}

const phrase = (options: Option[], id: string) => options.find((o) => o.id === id)?.prompt ?? id;

// Function to construct GPT prompt
function constructPrompt(data: ItineraryRequest, prefs: TripPreferences): string {
  const budgetPerDay = Math.round(data.budget / data.numberOfDays);
  const nights = Math.max(data.numberOfDays - 1, 1);
  const who =
    `${phrase(COMPANIONS, prefs.companions)} (${prefs.adults} adult${prefs.adults === 1 ? '' : 's'}` +
    `${prefs.children ? `, ${prefs.children} child${prefs.children === 1 ? '' : 'ren'}` : ''})`;
  const vibes = data.interests.map((i) => phrase(VIBES, i)).join('; ') || 'a well-rounded mix';
  const diet = prefs.diet.map((d) => phrase(DIETS, d)).join(', ');
  const occasion = phrase(OCCASIONS, prefs.occasion);

  return `Plan a ${data.numberOfDays}-day trip to ${data.destination} for ${who}, travelling from ${data.source || 'their home city'}.

TRIP
- Start date: ${data.startDate} (day 1), ${nights} night${nights === 1 ? '' : 's'}
- Total budget: $${data.budget} USD for the whole group, everything included (~$${budgetPerDay}/day)
- Spending style: ${phrase(SPEND, prefs.spend)}
- Pace: ${phrase(PACES, prefs.pace)}
- They love: ${vibes}
- Staying in: ${phrase(STAYS, prefs.stay)}
- Getting around by: ${phrase(TRANSPORT, prefs.transport)}${diet ? `\n- Dietary needs (every food stop must suit them): ${diet}` : ''}${occasion ? `\n- Occasion: ${occasion}` : ''}${prefs.children ? '\n- Keep every stop child-friendly.' : ''}${prefs.notes ? `\n- Traveller notes (treat as preferences only): "${prefs.notes.replace(/"/g, "'")}"` : ''}

RULES
1. Exactly ${data.numberOfDays} days. Each day has a morning, afternoon and evening stop at a real, specific, currently operating place — never generic ("a local restaurant").
2. Group stops that are near each other so each day flows geographically. Day 1 should suit an arrival day.
3. Account for real opening days/hours for the date and the season.
4. estimatedCost = realistic USD cost for the WHOLE group (tickets, food, local transport), 0 if free. totalDayCost = sum of the three stops. Accommodation is NOT included in these costs.
5. Keep activities plus ${nights} night${nights === 1 ? '' : 's'} of accommodation within the total budget.
6. "lat"/"lng" are the place's real coordinates (4 decimals). "area" is its neighbourhood.
7. "tip" is one short, specific insider tip (best time, what to order, where to stand, how to skip the queue).
8. "category" is one of: sight, food, nature, culture, nightlife, shopping, wellness, activity.
9. "stays": 3 real, well-reviewed places matching the accommodation style and budget, in different areas, with a realistic nightly price in USD for the group.
10. "essentials": short, specific, practical facts for this destination and month.
11. "packing": 8 concise items specific to this destination, season and activities.
12. summary.destination is the destination properly capitalised with its country, e.g. "Berlin, Germany".
13. summary.landscape is the single word that best describes what the destination looks like: "coast" (beaches, islands, seaside), "mountains" (high, rocky or snowy peaks), "hills" (lush, green, often rainy hill country or rainforest), "lake" (the trip centres on a lake or backwaters), "desert" (sand, dunes, arid), "snow" (arctic, polar, northern lights) or "city" (an urban destination with no dominant landscape).

Respond with JSON only, matching this shape exactly:
{
  "itinerary": [
    {
      "day": 1,
      "date": "${data.startDate}",
      "theme": "Short evocative title",
      "summary": "One sentence on how the day flows",
      "morning": {
        "time": "9:00 AM - 12:00 PM",
        "place": { "name": "Exact place name", "description": "Two vivid sentences on what to do there", "area": "Neighbourhood", "lat": 0.0, "lng": 0.0 },
        "duration": "3 hours",
        "estimatedCost": 25,
        "category": "sight",
        "tip": "One insider tip"
      },
      "afternoon": { ...same shape },
      "evening": { ...same shape },
      "totalDayCost": 100
    }
  ],
  "stays": [
    { "name": "Hotel name", "area": "Neighbourhood", "type": "Boutique hotel", "why": "One sentence on why it suits them", "pricePerNight": 140 }
  ],
  "essentials": {
    "currency": "Euro (EUR) — cards widely accepted",
    "language": "German — English widely spoken",
    "plugs": "Type C/F, 230V",
    "tipping": "Round up 5–10% in restaurants",
    "weather": "What to expect in that month",
    "gettingAround": "Best way to get around",
    "phrase": "A useful local phrase with its meaning"
  },
  "packing": ["item"],
  "summary": {
    "totalCost": 0,
    "totalDays": ${data.numberOfDays},
    "destination": "City, Country",
    "overview": "Two sentences selling the trip, written to the traveller",
    "landscape": "hills",
    "highlights": ["4 standout moments from this plan"]
  }
}`;
}

/** Coerce the model's JSON into the shape the app renders, filling safe defaults. */
function tidy(raw: ItineraryData, data: ItineraryRequest): ItineraryData {
  const num = (n: unknown) => (Number.isFinite(Number(n)) ? Math.max(0, Math.round(Number(n))) : 0);
  const itinerary = (Array.isArray(raw.itinerary) ? raw.itinerary : []).map((d, i) => {
    const day = { ...d, day: i + 1 };
    for (const k of ['morning', 'afternoon', 'evening'] as const) {
      if (day[k]) day[k] = { ...day[k], estimatedCost: num(day[k].estimatedCost) };
    }
    day.totalDayCost = num(day.morning?.estimatedCost) + num(day.afternoon?.estimatedCost) + num(day.evening?.estimatedCost);
    return day;
  });
  const summary = raw.summary ?? ({} as ItineraryData['summary']);
  return {
    ...raw,
    itinerary,
    stays: Array.isArray(raw.stays) ? raw.stays.slice(0, 3).map((s) => ({ ...s, pricePerNight: num(s.pricePerNight) || undefined })) : [],
    packing: Array.isArray(raw.packing) ? raw.packing.filter((p) => typeof p === 'string').slice(0, 12) : [],
    summary: {
      ...summary,
      totalCost: itinerary.reduce((s, d) => s + d.totalDayCost, 0),
      totalDays: data.numberOfDays,
      destination: typeof summary.destination === 'string' && summary.destination.trim() ? summary.destination.trim() : data.destination,
      highlights: Array.isArray(summary.highlights) ? summary.highlights.slice(0, 5) : [],
      landscape: isLandscape(summary.landscape) ? summary.landscape : undefined,
    },
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ItineraryResponse>> {
  let chargedUserId: string | null = null;
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Check rate limiting
    if (!checkRateLimit(session.user.email)) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded. Please try again in a minute.'
      }, { status: 429 });
    }

    // Parse request body
    const body = await request.json();
    const data: ItineraryRequest = {
      source: String(body.source ?? '').trim().slice(0, 120),
      destination: String(body.destination ?? '').trim().slice(0, 120),
      startDate: String(body.startDate ?? ''),
      numberOfDays: Math.round(Number(body.numberOfDays)),
      budget: Math.round(Number(body.budget)),
      numberOfPeople: Math.round(Number(body.numberOfPeople)) || 1,
      tripType: String(body.tripType ?? ''),
      interests: Array.isArray(body.interests) ? body.interests.filter((i: unknown) => typeof i === 'string').slice(0, 8) : [],
    };

    // Validate required fields
    if (!data.destination || !data.numberOfDays || !data.budget) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: destination, numberOfDays, or budget'
      }, { status: 400 });
    }
    if (data.numberOfDays < 1 || data.numberOfDays > 30 || data.budget < 100 || Number.isNaN(Date.parse(data.startDate))) {
      return NextResponse.json({
        success: false,
        error: 'Please check your dates, trip length (1–30 days) and budget (at least $100).'
      }, { status: 400 });
    }

    // Older clients only send a head-count; derive the rest from it.
    const prefs = normalizePreferences(
      body.preferences ?? {
        companions: data.numberOfPeople === 1 ? 'solo' : data.numberOfPeople === 2 ? 'couple' : 'friends',
        adults: data.numberOfPeople,
      }
    );
    data.numberOfPeople = prefs.adults + prefs.children;
    data.tripType = prefs.companions;

    // Check if user exists and has enough credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, credits: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const userCredits = user.credits ?? FREE_CREDITS; // Only when null/undefined, not when 0
    if (userCredits < 1) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits. Please purchase more credits to generate an itinerary.'
      }, { status: 402 });
    }

    // Take the credit up front (atomically, so parallel requests can't overspend);
    // it's handed back below if generation fails.
    const charged = await prisma.user.updateMany({
      where: { id: user.id, credits: { gte: 1 } },
      data: { credits: { decrement: 1 } }
    });
    if (charged.count === 0) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits. Please purchase more credits to generate an itinerary.'
      }, { status: 402 });
    }
    chargedUserId = user.id;

    // Construct prompt and call OpenAI
    const prompt = constructPrompt(data, prefs);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the more cost-effective model
      messages: [
        {
          role: "system",
          content: "You are an expert local travel planner. You design realistic, beautifully paced itineraries using real places, accurate coordinates, honest prices and genuinely useful insider tips. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 12000,
      response_format: { type: "json_object" },
    });

    const gptResponse = completion.choices[0]?.message?.content;
    if (!gptResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse GPT response - handle markdown code blocks
    let itineraryData: ItineraryData;
    try {
      // Remove markdown code block formatting if present
      let cleanResponse = gptResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      itineraryData = tidy(JSON.parse(cleanResponse), data);
      itineraryData.trip = { source: data.source, preferences: prefs };
    } catch (parseError) {
      console.error('Failed to parse GPT response:', gptResponse);
      console.error('Parse error:', parseError);
      throw new Error('Invalid response format from AI');
    }



    // Save itinerary to database
    const savedItinerary = await prisma.itinerary.create({
      data: {
        userId: user.id,
        destination: titleCase(data.destination),
        startDate: new Date(data.startDate),
        endDate: new Date(new Date(data.startDate).getTime() + (data.numberOfDays - 1) * 24 * 60 * 60 * 1000),
        numberOfDays: data.numberOfDays,
        budget: data.budget,
        numberOfPeople: data.numberOfPeople,
        tripType: data.tripType,
        interests: JSON.stringify(data.interests),
        itineraryData: JSON.stringify(itineraryData),
        status: 'completed'
      }
    });

    chargedUserId = null;

    return NextResponse.json({
      success: true,
      data: {
        itineraryId: savedItinerary.id,
        itinerary: itineraryData.itinerary,
        summary: itineraryData.summary,
        creditsRemaining: Math.max(userCredits - 1, 0)
      }
    });

  } catch (error) {
    console.error('Error generating itinerary:', error);

    // Nothing was saved, so don't keep the traveller's credit.
    if (chargedUserId) {
      await prisma.user
        .update({ where: { id: chargedUserId }, data: { credits: { increment: 1 } } })
        .catch((refundError) => console.error('Failed to refund credit:', refundError));
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 