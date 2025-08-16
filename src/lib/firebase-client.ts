import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo',
};

// Initialize Firebase only if we have real credentials
let app: any = null;
let auth: any = null;
let db: any = null;

if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  
  // Connect to emulators in development
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    try {
      // Only connect if not already connected
      if (!auth.emulatorConfig) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      // Check if Firestore emulator is not already connected
      const firestoreSettings = (db as any)._delegate._databaseId;
      if (firestoreSettings.host === 'firestore.googleapis.com') {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
    } catch (error) {
      // Emulators might not be running, continue without them
      console.log('Firebase emulators not connected:', error);
    }
  }
} else {
  console.warn('Firebase not initialized - missing environment variables');
}

export { auth, db };
export default app;
