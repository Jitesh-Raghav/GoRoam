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

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Fetch user's itineraries
    const itineraries = await prisma.itinerary.findMany({
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
    });

    // Format the data for the frontend
    const formattedItineraries = itineraries.map(itinerary => ({
      id: itinerary.id,
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