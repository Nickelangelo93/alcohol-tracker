import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyAfEla9-z2nl8WeR8cMTdcX_RU_gGgQRXI',
  authDomain: 'alcohol-app-5bc9e.firebaseapp.com',
  projectId: 'alcohol-app-5bc9e',
  storageBucket: 'alcohol-app-5bc9e.firebasestorage.app',
  messagingSenderId: '934198558834',
  appId: '1:934198558834:web:a237c6829888eeb72002eb',
};

// Initialize Firebase app (avoid duplicate init)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with proper persistence
// On web, use indexedDB persistence; on native, default persistence works
let auth: ReturnType<typeof getAuth>;
if (Platform.OS === 'web') {
  try {
    auth = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    });
  } catch {
    // Already initialized
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
