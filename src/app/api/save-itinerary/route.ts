import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itineraryId, userId, itineraryData } = body;

    // In real implementation, this would save to database
    const savedItinerary = {
      id: itineraryId || "itinerary_" + Date.now(),
      userId,
      ...itineraryData,
      savedAt: new Date().toISOString(),
      status: "saved"
    };

    return NextResponse.json({
      success: true,
      data: savedItinerary,
      message: "Itinerary saved successfully"
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save itinerary' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // In real implementation, this would fetch from database
    const mockItineraries = [
      {
        id: "itinerary_1",
        destination: "Paris, France",
        duration: "5 days",
        savedAt: "2024-01-15T10:00:00Z",
        thumbnail: "paris-thumb.jpg"
      },
      {
        id: "itinerary_2", 
        destination: "Tokyo, Japan",
        duration: "7 days",
        savedAt: "2024-01-10T15:30:00Z",
        thumbnail: "tokyo-thumb.jpg"
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockItineraries
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch itineraries' },
      { status: 500 }
    );
  }
} 