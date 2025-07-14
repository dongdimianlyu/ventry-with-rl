import admin, { ServiceAccount } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Attempt to initialize Firebase Admin SDK only if required environment variables are present.
let db: FirebaseFirestore.Firestore | null = null;

if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  try {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    db = getFirestore();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
} else {
  // In build environments (or local without credentials), Firebase may be intentionally disabled.
  console.warn('Firebase credentials not found. Firestore will be disabled for this build environment.');
}

export { db }; 