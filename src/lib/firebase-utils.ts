import { db } from './firebase';

export interface DemoRequest {
  email: string;
  type: 'get_demo' | 'book_demo';
  timestamp: any;
  userAgent?: string;
  referrer?: string;
}

export async function saveDemoRequest(email: string, type: 'get_demo' | 'book_demo'): Promise<string> {
  try {
    // If Firebase is not configured, use fallback storage
    if (!db) {
      console.warn('Firebase not configured, using fallback demo request storage');
      // Generate a fake ID for consistency
      const fakeId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log the request for monitoring (in production, you might want to use a different logging service)
      console.log('Demo request (fallback):', {
        id: fakeId,
        email,
        type,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        referrer: typeof window !== 'undefined' ? document.referrer : 'direct'
      });
      
      return fakeId;
    }

    const demoRequest: DemoRequest = {
      email,
      type,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };

    const docRef = await db.collection('demo_requests').add(demoRequest);
    return docRef.id;
  } catch (error) {
    console.error('Error saving demo request:', error);
    // Even if Firebase fails, don't crash the request - use fallback
    const fallbackId = `demo_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Demo request (fallback after error):', {
      id: fallbackId,
      email,
      type,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return fallbackId;
  }
}

export async function saveEmailSubscription(email: string): Promise<string> {
  try {
    // If Firebase is not configured, use fallback storage
    if (!db) {
      console.warn('Firebase not configured, using fallback email subscription storage');
      // Generate a fake ID for consistency
      const fakeId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log the subscription for monitoring
      console.log('Email subscription (fallback):', {
        id: fakeId,
        email,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        referrer: typeof window !== 'undefined' ? document.referrer : 'direct'
      });
      
      return fakeId;
    }

    const subscription = {
      email,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };

    const docRef = await db.collection('email_subscriptions').add(subscription);
    return docRef.id;
  } catch (error) {
    console.error('Error saving email subscription:', error);
    // Even if Firebase fails, don't crash the request - use fallback
    const fallbackId = `email_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Email subscription (fallback after error):', {
      id: fallbackId,
      email,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return fallbackId;
  }
} 