import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;
    
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

    // Fetch the itinerary
    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id: id,
        userId: user.id // Ensure user can only access their own itineraries
      }
    });

    if (!itinerary) {
      return NextResponse.json({
        success: false,
        error: 'Itinerary not found'
      }, { status: 404 });
    }

    // Parse the stored data
    const itineraryData = JSON.parse(itinerary.itineraryData);
    const interests = JSON.parse(itinerary.interests);

    return NextResponse.json({
      success: true,
      data: {
        id: itinerary.id,
        destination: itinerary.destination,
        startDate: itinerary.startDate.toISOString(),
        endDate: itinerary.endDate.toISOString(),
        numberOfDays: itinerary.numberOfDays,
        budget: itinerary.budget,
        numberOfPeople: itinerary.numberOfPeople,
        tripType: itinerary.tripType,
        interests,
        itineraryData,
        createdAt: itinerary.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching itinerary:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 