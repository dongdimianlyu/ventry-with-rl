import { NextRequest, NextResponse } from 'next/server';
import { saveEmailSubscription } from '@/lib/firebase-utils';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save to Firebase
    const docId = await saveEmailSubscription(email);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email subscription saved successfully',
        id: docId 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing email subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 