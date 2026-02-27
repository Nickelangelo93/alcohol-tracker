import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { FriendRequest } from '../../types/social';
import { spacing, borderRadius, fontSize } from '../../constants/theme';

interface Props {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}

export function FriendRequestCard({ request, onAccept, onReject }: Props) {
  const { themeColors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { borderBottomColor: themeColors.border }]}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: themeColors.primarySoft }]}>
          <Text style={styles.avatarEmoji}>{request.fromAvatar}</Text>
        </View>
        <Text style={[styles.name, { color: themeColors.text }]}>{request.fromName}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: themeColors.primary }]}
          onPress={onAccept}
        >
          <Text style={styles.acceptText}>{t.social.friends.accept}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rejectButton, { backgroundColor: themeColors.surfaceLight }]}
          onPress={onReject}
        >
          <Text style={[styles.rejectText, { color: themeColors.textSecondary }]}>
            {t.social.friends.reject}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  acceptText: {
    color: '#ffffff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  rejectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  rejectText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
