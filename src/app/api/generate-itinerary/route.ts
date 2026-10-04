import { NextRequest, NextResponse, after } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { normalizePreferences, titleCase, type ItineraryData } from '@/lib/trip';
import { SYSTEM_PROMPT, constructPrompt, tidy, type ItineraryRequest } from '@/lib/itinerary-ai';
import { FREE_CREDITS } from '@/lib/plans';
import { photosForItinerary } from '@/lib/place-photos';
import { generateGuide } from '@/lib/guide';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


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
    
    // The local guide is written alongside the day plan, so it adds no wait.
    // If it fails the trip still saves; the itinerary page writes it later.
    const guidePromise = generateGuide(openai, {
      destination: data.destination,
      source: data.source,
      startDate: data.startDate,
      numberOfDays: data.numberOfDays,
      interests: data.interests,
      preferences: prefs,
    }).catch((guideError) => {
      console.error('Guide generation failed:', guideError instanceof Error ? guideError.message : guideError);
      return undefined;
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the more cost-effective model
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
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
      delete itineraryData.guide;
    } catch (parseError) {
      console.error('Failed to parse GPT response:', gptResponse);
      console.error('Parse error:', parseError);
      throw new Error('Invalid response format from AI');
    }



    const guide = await guidePromise;
    if (guide) itineraryData.guide = guide;

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

    // Find the stops' photos while the traveller is being redirected, so the
    // trip usually opens with them ready (and saved for every later view).
    after(() =>
      photosForItinerary(savedItinerary).catch((error) => console.error('Pre-loading trip photos failed:', error))
    );

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