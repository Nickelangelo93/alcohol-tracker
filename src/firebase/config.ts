import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// getAuth auto-registers browser persistence + popup/redirect resolver on web
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
