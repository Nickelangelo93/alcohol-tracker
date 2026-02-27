import {
  signInAnonymously as firebaseSignInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  linkWithPopup,
  linkWithRedirect,
  User,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './config';

// Mobile browsers block popups — use redirect flow instead
function isMobileBrowser(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export async function signInAnonymously(): Promise<User> {
  const result = await firebaseSignInAnonymously(auth);
  return result.user;
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  if (isMobileBrowser()) {
    await signInWithRedirect(auth, provider);
    // After redirect, the result is handled by handleRedirectResult()
    return auth.currentUser!;
  }
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithApple(): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('name');
  provider.addScope('email');
  if (isMobileBrowser()) {
    await signInWithRedirect(auth, provider);
    return auth.currentUser!;
  }
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function linkAnonymousToGoogle(currentUser: User): Promise<User> {
  const provider = new GoogleAuthProvider();
  if (isMobileBrowser()) {
    await linkWithRedirect(currentUser, provider);
    return currentUser;
  }
  const result = await linkWithPopup(currentUser, provider);
  return result.user;
}

export async function linkAnonymousToApple(currentUser: User): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('name');
  provider.addScope('email');
  if (isMobileBrowser()) {
    await linkWithRedirect(currentUser, provider);
    return currentUser;
  }
  const result = await linkWithPopup(currentUser, provider);
  return result.user;
}

/**
 * Call this on app startup to handle the result of a redirect sign-in.
 * Returns the user if a redirect just completed, null otherwise.
 */
export async function handleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (error) {
    console.error('Redirect result error:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
