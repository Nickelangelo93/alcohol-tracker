import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { spacing, borderRadius, fontSize, shadows } from '../../constants/theme';
import { CreateGroupModal } from './CreateGroupModal';

export function GroupsSection() {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { groups, leaveGroup, deleteGroup } = useSocial();
  const [showCreate, setShowCreate] = useState(false);

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  return (
    <View>
      {/* Create Button */}
      <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.lg }}>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: themeColors.primary }]}
          onPress={() => setShowCreate(true)}
        >
          <Text style={styles.createButtonText}>{t.social.groups.createTitle}</Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      {groups.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: themeColors.surface }, cardShadow]}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            {t.social.groups.empty}
          </Text>
          <Text style={[styles.emptySubtext, { color: themeColors.textMuted }]}>
            {t.social.groups.emptySubtext}
          </Text>
        </View>
      ) : (
        groups.map((group) => (
          <View
            key={group.id}
            style={[styles.groupCard, { backgroundColor: themeColors.surface }, cardShadow]}
          >
            <View style={styles.groupHeader}>
              <View style={styles.groupLeft}>
                <View style={[styles.groupIcon, { backgroundColor: themeColors.primarySoft }]}>
                  <Text style={styles.groupEmoji}>{group.emoji}</Text>
                </View>
                <View>
                  <Text style={[styles.groupName, { color: themeColors.text }]}>
                    {group.name}
                  </Text>
                  <Text style={[styles.groupMembers, { color: themeColors.textMuted }]}>
                    {t.social.groups.members(group.memberUids.length)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Member list */}
            <View style={styles.memberList}>
              {group.members.map((member) => (
                <View key={member.uid} style={styles.memberRow}>
                  <Text style={styles.memberAvatar}>{member.avatar}</Text>
                  <Text style={[styles.memberName, { color: themeColors.textSecondary }]}>
                    {member.displayName}
                  </Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.groupActions}>
              {group.creatorUid === user?.uid ? (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.dangerSoft }]}
                  onPress={() => deleteGroup(group.id)}
                >
                  <Text style={[styles.actionText, { color: themeColors.danger }]}>
                    {t.social.groups.delete}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.surfaceLight }]}
                  onPress={() => leaveGroup(group.id)}
                >
                  <Text style={[styles.actionText, { color: themeColors.textSecondary }]}>
                    {t.social.groups.leave}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  createButton: {
    paddingVertical: 14,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
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
  groupCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupEmoji: {
    fontSize: 24,
  },
  groupName: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  groupMembers: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  memberList: {
    marginBottom: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  memberAvatar: {
    fontSize: 18,
  },
  memberName: {
    fontSize: fontSize.sm,
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
