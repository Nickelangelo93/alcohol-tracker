import {
  signInAnonymously as firebaseSignInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  linkWithPopup,
  User,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './config';

export async function signInAnonymously(): Promise<User> {
  const result = await firebaseSignInAnonymously(auth);
  return result.user;
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithApple(): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('name');
  provider.addScope('email');
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Link an anonymous account to Google (upgrade to full account).
 * The anonymous UID is preserved so all existing data stays intact.
 */
export async function linkAnonymousToGoogle(currentUser: User): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await linkWithPopup(currentUser, provider);
  return result.user;
}

/**
 * Link an anonymous account to Apple.
 */
export async function linkAnonymousToApple(currentUser: User): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('name');
  provider.addScope('email');
  const result = await linkWithPopup(currentUser, provider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
