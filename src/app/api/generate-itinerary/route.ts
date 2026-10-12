import { NextRequest, NextResponse, after } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeLegs, normalizePreferences, titleCase, type ItineraryData } from '@/lib/trip';
import { type ItineraryRequest } from '@/lib/itinerary-ai';
import { enrichTrip, finishTrip, generateFirstLook } from '@/lib/generate';

// The remaining days are written after the response; give them room.
export const maxDuration = 60;
import { FAIR_USE_PER_DAY, FREE_CREDITS, PLANS, passActive } from '@/lib/plans';
import { photosForItinerary } from '@/lib/place-photos';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();



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
    // Multi-city: "Delhi, Jaipur & Udaipur", with the legs for the planner.
    const legs = normalizeLegs(body.legs, data.numberOfDays);
    if (legs) {
      data.legs = legs;
      const names = legs.map((l) => l.city.split(',')[0]);
      data.destination = `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`.slice(0, 120);
    }

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
      select: { id: true, credits: true, passUntil: true, passPlan: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const userCredits = user.credits ?? FREE_CREDITS; // Only when null/undefined, not when 0
    // A running Week or Year Pass: no credit is spent, within fair use.
    const onPass = passActive(user);
    if (onPass) {
      const plan = PLANS.find((p) => p.id === user.passPlan) ?? PLANS[PLANS.length - 1];
      const since = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const [inPass, today] = await Promise.all([
        prisma.itinerary.count({ where: { userId: user.id, createdAt: { gte: since(plan.days) } } }),
        prisma.itinerary.count({ where: { userId: user.id, createdAt: { gte: since(1) } } }),
      ]);
      if (inPass >= plan.fairUse || today >= FAIR_USE_PER_DAY) {
        return NextResponse.json({
          success: false,
          error: today >= FAIR_USE_PER_DAY
            ? `That's ${FAIR_USE_PER_DAY} trips today, the daily fair-use limit. Plan more tomorrow.`
            : `You've planned ${inPass} trips on your ${plan.name}, its fair-use limit. Write to us if you need more.`,
        }, { status: 429 });
      }
    }
    if (!onPass && userCredits < 1) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits. Please purchase more credits to generate an itinerary.'
      }, { status: 402 });
    }

    if (!onPass) {
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
    }

    // The first look (day 1, the outline, stays and how to get there) comes back fast;
    // the other days are written after the response, and the trip page fills them in.
    const itineraryData = await generateFirstLook(data, prefs);

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
        status: itineraryData.pending?.length ? 'generating' : 'completed'
      }
    });

    chargedUserId = null;

    // Find the stops' photos while the traveller is being redirected, so the
    // trip usually opens with them ready (and saved for every later view).
    after(() =>
      Promise.all([
        photosForItinerary(savedItinerary).catch((error) => console.error('Pre-loading trip photos failed:', error)),
        finishTrip(savedItinerary.id, data, prefs).catch((error) => console.error('Writing the remaining days failed:', error)),
        enrichTrip(savedItinerary.id, data.destination).catch((error) => console.error('Checking places failed:', error)),
      ])
    );

    return NextResponse.json({
      success: true,
      data: {
        itineraryId: savedItinerary.id,
        itinerary: itineraryData.itinerary,
        summary: itineraryData.summary,
        creditsRemaining: onPass ? userCredits : Math.max(userCredits - 1, 0),
        pass: onPass
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