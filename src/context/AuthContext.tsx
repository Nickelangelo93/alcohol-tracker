import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  signInAnonymously,
  signInWithGoogle,
  signInWithApple,
  linkAnonymousToGoogle,
  linkAnonymousToApple,
  signOut as firebaseSignOut,
  handleRedirectResult,
} from '../firebase/auth';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  generateFriendCode,
  subscribeToUserProfile,
} from '../firebase/firestore';
import { UserProfile } from '../types/social';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signInAsGuest: () => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInApple: () => Promise<void>;
  upgradeToGoogle: () => Promise<void>;
  upgradeToApple: () => Promise<void>;
  logout: () => Promise<void>;
  setupProfile: (displayName: string, avatar: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserProfile(null);
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Handle redirect result (mobile browser Google/Apple sign-in)
  useEffect(() => {
    handleRedirectResult().then(async (redirectUser) => {
      if (redirectUser) {
        const existing = await getUserProfile(redirectUser.uid);
        if (!existing && !redirectUser.isAnonymous) {
          const name = redirectUser.displayName || 'User';
          await createUserProfile({
            uid: redirectUser.uid,
            displayName: name,
            avatar: '🍻',
            friendCode: generateFriendCode(name),
            friendUids: [],
            isAnonymous: false,
            createdAt: Date.now(),
          });
        }
        // If user was anonymous and linked, update profile
        if (existing && !redirectUser.isAnonymous && existing.isAnonymous) {
          await updateUserProfile(redirectUser.uid, { isAnonymous: false });
        }
      }
    });
  }, []);

  // Subscribe to user profile in Firestore when user changes
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserProfile(user.uid, (profile) => {
      setUserProfile(profile);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [user?.uid]);

  const signInAsGuest = useCallback(async () => {
    await signInAnonymously();
  }, []);

  const signInGoogle = useCallback(async () => {
    const googleUser = await signInWithGoogle();
    // Check if profile exists, if not create one
    const existing = await getUserProfile(googleUser.uid);
    if (!existing) {
      const name = googleUser.displayName || 'User';
      await createUserProfile({
        uid: googleUser.uid,
        displayName: name,
        avatar: '🍻',
        friendCode: generateFriendCode(name),
        friendUids: [],
        isAnonymous: false,
        createdAt: Date.now(),
      });
    }
  }, []);

  const signInApple = useCallback(async () => {
    const appleUser = await signInWithApple();
    const existing = await getUserProfile(appleUser.uid);
    if (!existing) {
      const name = appleUser.displayName || 'User';
      await createUserProfile({
        uid: appleUser.uid,
        displayName: name,
        avatar: '🍻',
        friendCode: generateFriendCode(name),
        friendUids: [],
        isAnonymous: false,
        createdAt: Date.now(),
      });
    }
  }, []);

  const upgradeToGoogle = useCallback(async () => {
    if (!user || !user.isAnonymous) return;
    const upgraded = await linkAnonymousToGoogle(user);
    await updateUserProfile(upgraded.uid, { isAnonymous: false });
  }, [user]);

  const upgradeToApple = useCallback(async () => {
    if (!user || !user.isAnonymous) return;
    const upgraded = await linkAnonymousToApple(user);
    await updateUserProfile(upgraded.uid, { isAnonymous: false });
  }, [user]);

  const logout = useCallback(async () => {
    await firebaseSignOut();
    setUserProfile(null);
  }, []);

  const setupProfile = useCallback(async (displayName: string, avatar: string) => {
    if (!user) return;
    const profile: UserProfile = {
      uid: user.uid,
      displayName,
      avatar,
      friendCode: generateFriendCode(displayName),
      friendUids: [],
      isAnonymous: user.isAnonymous,
      createdAt: Date.now(),
    };
    await createUserProfile(profile);
  }, [user]);

  const updateProfileFn = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, data);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAnonymous: user?.isAnonymous ?? true,
        signInAsGuest,
        signInGoogle,
        signInApple,
        upgradeToGoogle,
        upgradeToApple,
        logout,
        setupProfile,
        updateProfile: updateProfileFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
