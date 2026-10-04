import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // The session already carries the user's id; only look it up for older sessions.
    const sessionId = session.user.id;
    const user = sessionId
      ? { id: sessionId }
      : await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Fetch user's itineraries. The full itinerary JSON stays in the database;
    // the postcards only need its landscape, place and country, pulled out alongside.
    const [itineraries, posters] = await Promise.all([
      prisma.itinerary.findMany({
        where: {
          userId: user.id
        },
        select: {
          id: true,
          destination: true,
          startDate: true,
          endDate: true,
          numberOfDays: true,
          budget: true,
          numberOfPeople: true,
          tripType: true,
          interests: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc' // Show newest first
        }
      }),
      prisma.$queryRaw<{ id: string; landscape: string | null; place: string | null; country: string | null }[]>`
        SELECT id,
          substring("itineraryData" from '"landscape":"([a-z]+)"') AS landscape,
          substring("itineraryData" from '"destination":"([^"]{1,120})"') AS place,
          substring("itineraryData" from '"countryCode":"([a-z-]{2,6})"') AS country
        FROM "Itinerary"
        WHERE "userId" = ${user.id}
      `.catch((error) => {
        // Postcards fall back to picking their scene from the destination name.
        console.error('Poster details unavailable:', error);
        return [];
      }),
    ]);
    const poster = new Map(posters.map((p) => [p.id, p]));

    // Format the data for the frontend
    const formattedItineraries = itineraries.map(itinerary => ({
      id: itinerary.id,
      place: poster.get(itinerary.id)?.place ?? undefined,
      landscape: poster.get(itinerary.id)?.landscape ?? undefined,
      country: poster.get(itinerary.id)?.country ?? undefined,
      title: `${itinerary.destination} Adventure`,
      destination: itinerary.destination,
      startDate: itinerary.startDate.toISOString(),
      endDate: itinerary.endDate.toISOString(),
      numberOfDays: itinerary.numberOfDays,
      budget: itinerary.budget,
      numberOfPeople: itinerary.numberOfPeople,
      tripType: itinerary.tripType,
      interests: JSON.parse(itinerary.interests),
      status: itinerary.status,
      createdAt: itinerary.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedItineraries
    });

  } catch (error) {
    console.error('Error fetching itineraries:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}