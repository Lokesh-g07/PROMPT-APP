import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const USE_MOCK = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key';

// Initialize Firebase only if it hasn't been initialized already and we have a key
let app: any = null;
if (!USE_MOCK) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const db = app ? getFirestore(app) : ({} as any);
export const auth = app ? getAuth(app) : ({} as any);
export const googleProvider = app ? new GoogleAuthProvider() : ({} as any);
export const isMockMode = USE_MOCK;
