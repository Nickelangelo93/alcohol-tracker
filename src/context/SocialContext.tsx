import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToIncomingRequests,
  subscribeToMyGroups,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend as firestoreRemoveFriend,
  findUserByFriendCode,
  getFriendProfiles,
  createGroup as firestoreCreateGroup,
  leaveGroup as firestoreLeaveGroup,
  deleteGroup as firestoreDeleteGroup,
  addMemberToGroup,
} from '../firebase/firestore';
import {
  UserProfile,
  FriendRequest,
  DrinkGroup,
  GroupMember,
} from '../types/social';

interface SocialContextType {
  friends: UserProfile[];
  incomingRequests: FriendRequest[];
  groups: DrinkGroup[];
  isLoading: boolean;
  addFriendByCode: (code: string) => Promise<'sent' | 'not_found' | 'already_friend' | 'self'>;
  acceptRequest: (request: FriendRequest) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendUid: string) => Promise<void>;
  createGroup: (name: string, emoji: string, memberUids: string[]) => Promise<string>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  inviteToGroup: (groupId: string, member: GroupMember) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | null>(null);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<DrinkGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to incoming friend requests
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToIncomingRequests(user.uid, setIncomingRequests);
    return unsub;
  }, [user?.uid]);

  // Subscribe to groups
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMyGroups(user.uid, setGroups);
    return unsub;
  }, [user?.uid]);

  // Load friend profiles when userProfile.friendUids changes
  useEffect(() => {
    if (!userProfile || userProfile.friendUids.length === 0) {
      setFriends([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    getFriendProfiles(userProfile.friendUids).then((profiles) => {
      if (!cancelled) {
        setFriends(profiles);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [userProfile?.friendUids]);

  const addFriendByCode = useCallback(async (code: string): Promise<'sent' | 'not_found' | 'already_friend' | 'self'> => {
    if (!user || !userProfile) return 'not_found';

    const target = await findUserByFriendCode(code);
    if (!target) return 'not_found';
    if (target.uid === user.uid) return 'self';
    if (userProfile.friendUids.includes(target.uid)) return 'already_friend';

    await sendFriendRequest({
      fromUid: user.uid,
      toUid: target.uid,
      fromName: userProfile.displayName,
      fromAvatar: userProfile.avatar,
      status: 'pending',
      createdAt: Date.now(),
    });
    return 'sent';
  }, [user, userProfile]);

  const acceptRequest = useCallback(async (request: FriendRequest) => {
    await acceptFriendRequest(request.id, request.fromUid, request.toUid);
  }, []);

  const rejectRequest = useCallback(async (requestId: string) => {
    await rejectFriendRequest(requestId);
  }, []);

  const removeFriend = useCallback(async (friendUid: string) => {
    if (!user) return;
    await firestoreRemoveFriend(user.uid, friendUid);
  }, [user]);

  const createGroup = useCallback(async (name: string, emoji: string, memberUids: string[]): Promise<string> => {
    if (!user || !userProfile) return '';

    const allMemberUids = [user.uid, ...memberUids];
    const myMember: GroupMember = {
      uid: user.uid,
      displayName: userProfile.displayName,
      avatar: userProfile.avatar,
    };
    const otherMembers = friends
      .filter((f) => memberUids.includes(f.uid))
      .map((f): GroupMember => ({
        uid: f.uid,
        displayName: f.displayName,
        avatar: f.avatar,
      }));

    return firestoreCreateGroup({
      name,
      emoji,
      creatorUid: user.uid,
      memberUids: allMemberUids,
      members: [myMember, ...otherMembers],
      createdAt: Date.now(),
    });
  }, [user, userProfile, friends]);

  const leaveGroupFn = useCallback(async (groupId: string) => {
    if (!user) return;
    await firestoreLeaveGroup(groupId, user.uid);
  }, [user]);

  const deleteGroupFn = useCallback(async (groupId: string) => {
    await firestoreDeleteGroup(groupId);
  }, []);

  const inviteToGroup = useCallback(async (groupId: string, member: GroupMember) => {
    await addMemberToGroup(groupId, member);
  }, []);

  return (
    <SocialContext.Provider
      value={{
        friends,
        incomingRequests,
        groups,
        isLoading,
        addFriendByCode,
        acceptRequest,
        rejectRequest,
        removeFriend,
        createGroup,
        leaveGroup: leaveGroupFn,
        deleteGroup: deleteGroupFn,
        inviteToGroup,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}
