import { DrinkType } from './index';

// --- User ---
export interface UserProfile {
  uid: string;
  displayName: string;
  avatar: string; // emoji
  friendCode: string; // e.g. "NICK-A3F2"
  friendUids: string[];
  isAnonymous: boolean;
  createdAt: number;
}

// --- Friend Requests ---
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  fromAvatar: string;
  status: FriendRequestStatus;
  createdAt: number;
}

// --- Groups ---
export interface GroupMember {
  uid: string;
  displayName: string;
  avatar: string;
}

export interface DrinkGroup {
  id: string;
  name: string;
  emoji: string;
  creatorUid: string;
  memberUids: string[];
  members: GroupMember[];
  createdAt: number;
}

// --- Live Sessions ---
export type SessionStatus = 'active' | 'ended';

export interface LiveSession {
  id: string;
  name: string;
  joinCode: string; // 6-char uppercase
  hostUid: string;
  groupId?: string;
  memberUids: string[];
  status: SessionStatus;
  createdAt: number;
  expiresAt: number; // 24h from creation
}

export interface SessionDrink {
  type: DrinkType;
  timestamp: number;
}

export interface SessionParticipant {
  uid: string;
  displayName: string;
  avatar: string;
  totalDrinks: number;
  drinks: SessionDrink[];
  lastActivity: number;
}

// --- Social Tab ---
export type SocialSection = 'friends' | 'groups' | 'live';
