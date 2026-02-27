import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Unsubscribe,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import {
  UserProfile,
  FriendRequest,
  DrinkGroup,
  GroupMember,
  LiveSession,
  SessionParticipant,
  SessionDrink,
} from '../types/social';

// ========================
// USERS
// ========================

export async function createUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

export async function findUserByFriendCode(
  friendCode: string,
): Promise<UserProfile | null> {
  const q = query(
    collection(db, 'users'),
    where('friendCode', '==', friendCode.toUpperCase()),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfile;
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

// ========================
// FRIEND REQUESTS
// ========================

export async function sendFriendRequest(request: Omit<FriendRequest, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'friendRequests'), request);
  return ref.id;
}

export function subscribeToIncomingRequests(
  uid: string,
  callback: (requests: FriendRequest[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'friendRequests'),
    where('toUid', '==', uid),
    where('status', '==', 'pending'),
  );
  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FriendRequest));
    callback(requests);
  });
}

export async function acceptFriendRequest(requestId: string, fromUid: string, toUid: string): Promise<void> {
  // Update request status
  await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' });

  // Add each user to the other's friend list
  await updateDoc(doc(db, 'users', fromUid), { friendUids: arrayUnion(toUid) });
  await updateDoc(doc(db, 'users', toUid), { friendUids: arrayUnion(fromUid) });
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  await updateDoc(doc(db, 'friendRequests', requestId), { status: 'rejected' });
}

export async function removeFriend(myUid: string, friendUid: string): Promise<void> {
  await updateDoc(doc(db, 'users', myUid), { friendUids: arrayRemove(friendUid) });
  await updateDoc(doc(db, 'users', friendUid), { friendUids: arrayRemove(myUid) });
}

export async function getFriendProfiles(friendUids: string[]): Promise<UserProfile[]> {
  if (friendUids.length === 0) return [];
  // Firestore `in` query supports max 30 items
  const profiles: UserProfile[] = [];
  const chunks = [];
  for (let i = 0; i < friendUids.length; i += 30) {
    chunks.push(friendUids.slice(i, i + 30));
  }
  for (const chunk of chunks) {
    const q = query(collection(db, 'users'), where('uid', 'in', chunk));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => profiles.push(d.data() as UserProfile));
  }
  return profiles;
}

// ========================
// GROUPS
// ========================

export async function createGroup(group: Omit<DrinkGroup, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'groups'), group);
  return ref.id;
}

export function subscribeToMyGroups(
  uid: string,
  callback: (groups: DrinkGroup[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'groups'),
    where('memberUids', 'array-contains', uid),
  );
  return onSnapshot(q, (snap) => {
    const groups = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DrinkGroup));
    callback(groups);
  });
}

export async function addMemberToGroup(
  groupId: string,
  member: GroupMember,
): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId), {
    memberUids: arrayUnion(member.uid),
    members: arrayUnion(member),
  });
}

export async function leaveGroup(groupId: string, uid: string): Promise<void> {
  const groupSnap = await getDoc(doc(db, 'groups', groupId));
  if (!groupSnap.exists()) return;

  const group = groupSnap.data() as DrinkGroup;
  const updatedMembers = group.members.filter((m) => m.uid !== uid);

  await updateDoc(doc(db, 'groups', groupId), {
    memberUids: arrayRemove(uid),
    members: updatedMembers,
  });
}

export async function deleteGroup(groupId: string): Promise<void> {
  await deleteDoc(doc(db, 'groups', groupId));
}

// ========================
// LIVE SESSIONS
// ========================

export async function createSession(session: Omit<LiveSession, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'sessions'), session);
  return ref.id;
}

export async function findSessionByCode(joinCode: string): Promise<LiveSession | null> {
  const q = query(
    collection(db, 'sessions'),
    where('joinCode', '==', joinCode.toUpperCase()),
    where('status', '==', 'active'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as LiveSession;
}

export async function joinSession(sessionId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    memberUids: arrayUnion(uid),
  });
}

export async function endSession(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), { status: 'ended' });
}

export function subscribeToSession(
  sessionId: string,
  callback: (session: LiveSession | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'sessions', sessionId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as LiveSession) : null);
  });
}

// --- Session Participants ---

export async function setParticipant(
  sessionId: string,
  participant: SessionParticipant,
): Promise<void> {
  await setDoc(
    doc(db, 'sessions', sessionId, 'participants', participant.uid),
    participant,
  );
}

export async function addDrinkToParticipant(
  sessionId: string,
  uid: string,
  drink: SessionDrink,
): Promise<void> {
  const ref = doc(db, 'sessions', sessionId, 'participants', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as SessionParticipant;
  await updateDoc(ref, {
    totalDrinks: data.totalDrinks + 1,
    drinks: arrayUnion(drink),
    lastActivity: Date.now(),
  });
}

export function subscribeToParticipants(
  sessionId: string,
  callback: (participants: SessionParticipant[]) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'sessions', sessionId, 'participants'),
    (snap) => {
      const participants = snap.docs.map((d) => d.data() as SessionParticipant);
      // Sort by totalDrinks descending (leaderboard)
      participants.sort((a, b) => b.totalDrinks - a.totalDrinks);
      callback(participants);
    },
  );
}

// ========================
// HELPERS
// ========================

export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for clarity
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateFriendCode(displayName: string): string {
  const name = displayName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${name}-${suffix}`;
}
