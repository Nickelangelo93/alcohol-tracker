import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useDrinks } from './DrinkContext';
import {
  createSession as firestoreCreateSession,
  findSessionByCode,
  joinSession as firestoreJoinSession,
  endSession as firestoreEndSession,
  subscribeToSession,
  setParticipant,
  addDrinkToParticipant,
  subscribeToParticipants,
  generateJoinCode,
} from '../firebase/firestore';
import { LiveSession, SessionParticipant, SessionDrink } from '../types/social';

interface SessionContextType {
  activeSession: LiveSession | null;
  participants: SessionParticipant[];
  isInSession: boolean;
  startSession: (name: string, groupId?: string) => Promise<string>;
  joinSessionByCode: (code: string) => Promise<boolean>;
  leaveSession: () => void;
  endCurrentSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();
  const { todayDrinks } = useDrinks();
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const prevDrinkCountRef = useRef(0);

  // Subscribe to active session
  useEffect(() => {
    if (!sessionId) {
      setActiveSession(null);
      setParticipants([]);
      return;
    }

    const unsubSession = subscribeToSession(sessionId, (session) => {
      if (!session || session.status === 'ended') {
        setActiveSession(null);
        setSessionId(null);
        return;
      }
      // Check expiry
      if (Date.now() > session.expiresAt) {
        setActiveSession(null);
        setSessionId(null);
        return;
      }
      setActiveSession(session);
    });

    const unsubParticipants = subscribeToParticipants(sessionId, setParticipants);

    return () => {
      unsubSession();
      unsubParticipants();
    };
  }, [sessionId]);

  // Sync drinks to session when todayDrinks changes
  useEffect(() => {
    if (!sessionId || !user || !userProfile) return;
    if (todayDrinks.length <= prevDrinkCountRef.current) {
      prevDrinkCountRef.current = todayDrinks.length;
      return;
    }

    // New drinks detected — push the latest ones to the session
    const newDrinks = todayDrinks.slice(0, todayDrinks.length - prevDrinkCountRef.current);
    prevDrinkCountRef.current = todayDrinks.length;

    for (const drink of newDrinks) {
      const sessionDrink: SessionDrink = {
        type: drink.type,
        timestamp: drink.timestamp,
      };
      addDrinkToParticipant(sessionId, user.uid, sessionDrink).catch(console.error);
    }
  }, [todayDrinks.length, sessionId, user, userProfile]);

  const startSession = useCallback(async (name: string, groupId?: string): Promise<string> => {
    if (!user || !userProfile) return '';

    const joinCode = generateJoinCode();
    const id = await firestoreCreateSession({
      name,
      joinCode,
      hostUid: user.uid,
      groupId,
      memberUids: [user.uid],
      status: 'active',
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
    });

    // Add self as participant
    await setParticipant(id, {
      uid: user.uid,
      displayName: userProfile.displayName,
      avatar: userProfile.avatar,
      totalDrinks: todayDrinks.length,
      drinks: todayDrinks.map((d) => ({ type: d.type, timestamp: d.timestamp })),
      lastActivity: Date.now(),
    });

    prevDrinkCountRef.current = todayDrinks.length;
    setSessionId(id);
    return joinCode;
  }, [user, userProfile, todayDrinks]);

  const joinSessionByCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user || !userProfile) return false;

    const session = await findSessionByCode(code);
    if (!session) return false;

    await firestoreJoinSession(session.id, user.uid);

    // Add self as participant
    await setParticipant(session.id, {
      uid: user.uid,
      displayName: userProfile.displayName,
      avatar: userProfile.avatar,
      totalDrinks: todayDrinks.length,
      drinks: todayDrinks.map((d) => ({ type: d.type, timestamp: d.timestamp })),
      lastActivity: Date.now(),
    });

    prevDrinkCountRef.current = todayDrinks.length;
    setSessionId(session.id);
    return true;
  }, [user, userProfile, todayDrinks]);

  const leaveSession = useCallback(() => {
    setSessionId(null);
    setActiveSession(null);
    setParticipants([]);
  }, []);

  const endCurrentSession = useCallback(async () => {
    if (!sessionId) return;
    await firestoreEndSession(sessionId);
    setSessionId(null);
    setActiveSession(null);
    setParticipants([]);
  }, [sessionId]);

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        participants,
        isInSession: !!activeSession,
        startSession,
        joinSessionByCode,
        leaveSession,
        endCurrentSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
