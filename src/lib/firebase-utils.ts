import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
    const demoRequest: DemoRequest = {
      email,
      type,
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };

    const docRef = await addDoc(collection(db, 'demo_requests'), demoRequest);
    return docRef.id;
  } catch (error) {
    console.error('Error saving demo request:', error);
    throw error;
  }
}

export async function saveEmailSubscription(email: string): Promise<string> {
  try {
    const subscription = {
      email,
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };

    const docRef = await addDoc(collection(db, 'email_subscriptions'), subscription);
    return docRef.id;
  } catch (error) {
    console.error('Error saving email subscription:', error);
    throw error;
  }
} 