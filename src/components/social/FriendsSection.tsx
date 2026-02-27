import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { spacing, borderRadius, fontSize, shadows } from '../../constants/theme';
import { FriendRequestCard } from './FriendRequestCard';

export function FriendsSection() {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const { friends, incomingRequests, addFriendByCode, acceptRequest, rejectRequest, removeFriend } = useSocial();
  const [friendCode, setFriendCode] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  const handleAddFriend = async () => {
    if (!friendCode.trim()) return;
    setAdding(true);
    setMessage(null);
    const result = await addFriendByCode(friendCode.trim());
    switch (result) {
      case 'sent': setMessage(t.social.friends.requestSent); break;
      case 'not_found': setMessage(t.social.friends.notFound); break;
      case 'already_friend': setMessage(t.social.friends.alreadyFriend); break;
      case 'self': setMessage(t.social.friends.cannotAddSelf); break;
    }
    setFriendCode('');
    setAdding(false);
  };

  const handleCopyCode = async () => {
    if (!userProfile) return;
    await Clipboard.setStringAsync(userProfile.friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View>
      {/* My Friend Code */}
      {userProfile && (
        <TouchableOpacity
          style={[styles.codeCard, { backgroundColor: themeColors.surface }, cardShadow]}
          onPress={handleCopyCode}
          activeOpacity={0.7}
        >
          <Text style={[styles.codeLabel, { color: themeColors.textSecondary }]}>
            {t.social.profile.friendCodeLabel}
          </Text>
          <Text style={[styles.codeValue, { color: themeColors.primary }]}>
            {userProfile.friendCode}
          </Text>
          <Text style={[styles.codeTap, { color: themeColors.textMuted }]}>
            {copied ? t.social.profile.friendCodeCopied : t.social.profile.tapToCopy}
          </Text>
        </TouchableOpacity>
      )}

      {/* Add Friend */}
      <View style={[styles.addCard, { backgroundColor: themeColors.surface }, cardShadow]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          {t.social.friends.addTitle}
        </Text>
        <View style={styles.addRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.surfaceLight,
                color: themeColors.text,
                borderColor: themeColors.border,
              },
            ]}
            placeholder={t.social.friends.addPlaceholder}
            placeholderTextColor={themeColors.textMuted}
            value={friendCode}
            onChangeText={setFriendCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: themeColors.primary }]}
            onPress={handleAddFriend}
            disabled={adding || !friendCode.trim()}
          >
            {adding ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.addButtonText}>{t.social.friends.addButton}</Text>
            )}
          </TouchableOpacity>
        </View>
        {message && (
          <Text style={[styles.message, { color: themeColors.textSecondary }]}>
            {message}
          </Text>
        )}
      </View>

      {/* Friend Requests */}
      {incomingRequests.length > 0 && (
        <View style={[styles.section, { backgroundColor: themeColors.surface }, cardShadow]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t.social.friends.requestsTitle}
          </Text>
          {incomingRequests.map((req) => (
            <FriendRequestCard
              key={req.id}
              request={req}
              onAccept={() => acceptRequest(req)}
              onReject={() => rejectRequest(req.id)}
            />
          ))}
        </View>
      )}

      {/* Friends List */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }, cardShadow]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          {t.social.friends.title}
        </Text>
        {friends.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👋</Text>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              {t.social.friends.empty}
            </Text>
            <Text style={[styles.emptySubtext, { color: themeColors.textMuted }]}>
              {t.social.friends.emptySubtext}
            </Text>
          </View>
        ) : (
          friends.map((friend) => (
            <View key={friend.uid} style={[styles.friendRow, { borderBottomColor: themeColors.border }]}>
              <View style={styles.friendLeft}>
                <View style={[styles.avatarCircle, { backgroundColor: themeColors.primarySoft }]}>
                  <Text style={styles.avatarText}>{friend.avatar}</Text>
                </View>
                <Text style={[styles.friendName, { color: themeColors.text }]}>
                  {friend.displayName}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: themeColors.dangerSoft }]}
                onPress={() => removeFriend(friend.uid)}
              >
                <Text style={[styles.removeText, { color: themeColors.danger }]}>
                  {t.social.friends.remove}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  codeValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  codeTap: {
    fontSize: fontSize.xs,
  },
  addCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  addRow: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.sm,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  message: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  section: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  friendName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  removeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
