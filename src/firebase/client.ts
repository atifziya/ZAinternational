import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
  storage: FirebaseStorage;
  appCheck?: AppCheck;
  analytics?: Analytics;
}

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseConfigDiagnostic(): { configured: boolean; missingFields: string[] } {
  const missing: string[] = [];
  if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!config.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!config.appId) missing.push('VITE_FIREBASE_APP_ID');
  return {
    configured: missing.length === 0,
    missingFields: missing,
  };
}

export const hasFirebaseConfig = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

let cached: FirebaseServices | undefined;

export function firebaseServices(): FirebaseServices {
  const diagnostic = getFirebaseConfigDiagnostic();
  if (!diagnostic.configured) {
    throw new Error(
      `Firebase is not properly configured. Missing required environment variables: ${diagnostic.missingFields.join(', ')}. Please verify .env.local.`
    );
  }

  if (cached) return cached;
  const app = getApps().length ? getApp() : initializeApp(config);

  let appCheck: AppCheck | undefined;
  const appCheckKey = import.meta.env.VITE_FIREBASE_APPCHECK_KEY;
  if (typeof window !== 'undefined' && appCheckKey && appCheckKey.trim() !== '') {
    try {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckKey.trim()),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      console.warn('App Check initialization skipped or failed:', error);
    }
  }

  let analytics: Analytics | undefined;
  if (typeof window !== 'undefined' && config.measurementId && config.measurementId.trim() !== '') {
    void isSupported()
      .then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      })
      .catch((error) => {
        console.warn('Firebase Analytics initialization skipped:', error);
      });
  }

  cached = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    functions: getFunctions(app, import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'asia-south1'),
    storage: getStorage(app),
    appCheck,
    analytics,
  };
  return cached;
}
