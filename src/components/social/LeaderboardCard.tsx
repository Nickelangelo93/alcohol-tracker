import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { SessionParticipant } from '../../types/social';
import { spacing, borderRadius, fontSize } from '../../constants/theme';

interface Props {
  participant: SessionParticipant;
  rank: number;
  isMe: boolean;
}

const RANK_EMOJIS: Record<number, string> = {
  1: '👑',
  2: '🥈',
  3: '🥉',
};

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export function LeaderboardCard({ participant, rank, isMe }: Props) {
  const { themeColors } = useTheme();
  const { t } = useTranslation();

  const rankEmoji = RANK_EMOJIS[rank];
  const rankColor = RANK_COLORS[rank];

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: themeColors.border },
        isMe && { backgroundColor: themeColors.primarySoft, borderRadius: borderRadius.md },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.rankBadge, rankColor ? { backgroundColor: rankColor + '20' } : { backgroundColor: themeColors.surfaceLight }]}>
          <Text style={styles.rankText}>
            {rankEmoji || `#${rank}`}
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: themeColors.primarySoft }]}>
          <Text style={styles.avatarEmoji}>{participant.avatar}</Text>
        </View>
        <View>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: themeColors.text }]}>
              {participant.displayName}
            </Text>
            {isMe && (
              <Text style={[styles.youTag, { color: themeColors.primary }]}>
                {t.social.live.you}
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={[styles.drinksBadge, { backgroundColor: themeColors.primarySoft }]}>
        <Text style={[styles.drinksCount, { color: themeColors.primary }]}>
          {t.social.live.drinks(participant.totalDrinks)}
        </Text>
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
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  youTag: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  drinksBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  drinksCount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
