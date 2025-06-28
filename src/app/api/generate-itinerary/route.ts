import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

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
  tripType: 'national' | 'international';
  interests: string[];
}

interface PlaceDetails {
  name: string;
  description: string;
  googleMapsLink: string;
}

interface ActivitySlot {
  time: string;
  place: PlaceDetails;
  duration: string;
  estimatedCost: number;
}

interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  morning: ActivitySlot;
  afternoon: ActivitySlot;
  evening: ActivitySlot;
  totalDayCost: number;
}

interface ItineraryResponse {
  success: boolean;
  data?: {
    itineraryId: string;
    itinerary: DayItinerary[];
    summary: {
      totalCost: number;
      totalDays: number;
      destination: string;
      highlights: string[];
    };
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

// Function to construct GPT prompt
function constructPrompt(data: ItineraryRequest): string {
  const interestsText = data.interests.join(', ');
  const budgetPerDay = Math.round(data.budget / data.numberOfDays);
  
  return `You are a professional travel planner. Create a detailed ${data.numberOfDays}-day itinerary for ${data.numberOfPeople} ${data.numberOfPeople === 1 ? 'person' : 'people'} traveling from ${data.source} to ${data.destination}.

**Trip Details:**
- Destination: ${data.destination}
- Duration: ${data.numberOfDays} days
- Budget: $${data.budget} total (~$${budgetPerDay} per day)
- Trip Type: ${data.tripType}
- Interests: ${interestsText}
- Start Date: ${data.startDate}

**Requirements:**
1. Provide exactly ${data.numberOfDays} days of activities
2. Each day should have morning (9-12), afternoon (1-5), and evening (6-9) activities
3. Include specific place names, not generic descriptions
4. Estimate costs for each activity
5. Keep total daily cost around $${budgetPerDay}
6. Focus on interests: ${interestsText}
7. Include mix of popular attractions and hidden gems

**Response Format (JSON only, no other text):**
{
  "itinerary": [
    {
      "day": 1,
      "date": "2024-01-15",
      "theme": "Arrival & City Center Exploration",
      "morning": {
        "time": "9:00 AM - 12:00 PM",
        "place": {
          "name": "Specific Place Name",
          "description": "Detailed description of what to do here",
          "googleMapsLink": "https://maps.google.com/search/Specific+Place+Name+${data.destination.replace(/\s+/g, '+')}"
        },
        "duration": "3 hours",
        "estimatedCost": 25
      },
      "afternoon": {
        "time": "1:00 PM - 5:00 PM",
        "place": {
          "name": "Another Specific Place",
          "description": "What makes this place special",
          "googleMapsLink": "https://maps.google.com/search/Another+Specific+Place+${data.destination.replace(/\s+/g, '+')}"
        },
        "duration": "4 hours",
        "estimatedCost": 40
      },
      "evening": {
        "time": "6:00 PM - 9:00 PM",
        "place": {
          "name": "Evening Venue Name",
          "description": "Evening activity description",
          "googleMapsLink": "https://maps.google.com/search/Evening+Venue+Name+${data.destination.replace(/\s+/g, '+')}"
        },
        "duration": "3 hours",
        "estimatedCost": 35
      },
      "totalDayCost": 100
    }
  ],
  "summary": {
    "totalCost": ${data.budget},
    "totalDays": ${data.numberOfDays},
    "destination": "${data.destination}",
    "highlights": ["Top 3-5 must-do activities from the itinerary"]
  }
}`;
}



export async function POST(request: NextRequest): Promise<NextResponse<ItineraryResponse>> {
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
    const data: ItineraryRequest = await request.json();

    // Validate required fields
    if (!data.destination || !data.numberOfDays || !data.budget) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: destination, numberOfDays, or budget'
      }, { status: 400 });
    }

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

    const userCredits = user.credits ?? 3; // Default to 3 only if null/undefined, not if 0
    if (userCredits < 1) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits. Please purchase more credits to generate an itinerary.'
      }, { status: 402 });
    }

    // Deduct 1 credit from user BEFORE calling OpenAI to ensure it happens
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: userCredits - 1 },
      select: { credits: true }
    });

    // Construct prompt and call OpenAI
    const prompt = constructPrompt(data);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the more cost-effective model
      messages: [
        {
          role: "system",
          content: "You are a professional travel planner who creates detailed, realistic itineraries. Always respond with valid JSON only, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const gptResponse = completion.choices[0]?.message?.content;
    if (!gptResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse GPT response - handle markdown code blocks
    let itineraryData;
    try {
      // Remove markdown code block formatting if present
      let cleanResponse = gptResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      itineraryData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', gptResponse);
      console.error('Parse error:', parseError);
      throw new Error('Invalid response format from AI');
    }



    // Save itinerary to database
    const savedItinerary = await prisma.itinerary.create({
      data: {
        userId: user.id,
        destination: data.destination,
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

    return NextResponse.json({
      success: true,
      data: {
        itineraryId: savedItinerary.id,
        itinerary: itineraryData.itinerary,
        summary: itineraryData.summary,
        creditsRemaining: updatedUser.credits ?? 0
      }
    });

  } catch (error) {
    console.error('Error generating itinerary:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 