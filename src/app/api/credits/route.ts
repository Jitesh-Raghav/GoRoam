import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In real implementation, this would fetch from database based on user auth
    const mockUserCredits = {
      userId: "user_123",
      totalCredits: 20,
      usedCredits: 5,
      remainingCredits: 15,
      plan: "Pro",
      purchaseHistory: [
        {
          id: "purchase_1",
          date: "2024-01-15",
          credits: 20,
          amount: "₹299",
          plan: "Pro"
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockUserCredits
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount } = body;

    if (action === 'purchase') {
      // In real implementation, this would process payment and update database
      const mockPurchase = {
        id: "purchase_" + Date.now(),
        creditsAdded: amount,
        transactionId: "txn_" + Date.now(),
        status: "success"
      };

      return NextResponse.json({
        success: true,
        data: mockPurchase
      });
    }

    if (action === 'deduct') {
      // In real implementation, this would deduct credits from user account
      return NextResponse.json({
        success: true,
        message: `${amount} credits deducted successfully`
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process credit transaction' },
      { status: 500 }
    );
  }
} 