import { NextRequest, NextResponse } from 'next/server';
import { saveDemoRequest } from '@/lib/firebase-utils';

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate type
    if (!type || !['get_demo', 'book_demo'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      );
    }

    // Save to Firebase
    const docId = await saveDemoRequest(email, type);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Demo request submitted successfully',
        id: docId 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing demo request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 