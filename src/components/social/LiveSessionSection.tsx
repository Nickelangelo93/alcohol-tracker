import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { spacing, borderRadius, fontSize, shadows } from '../../constants/theme';
import { LeaderboardCard } from './LeaderboardCard';

export function LiveSessionSection() {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeSession, participants, isInSession, startSession, joinSessionByCode, leaveSession, endCurrentSession } = useSession();
  const [sessionName, setSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [starting, setStarting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [joinError, setJoinError] = useState(false);

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  const handleStart = async () => {
    if (!sessionName.trim()) return;
    setStarting(true);
    try {
      const code = await startSession(sessionName.trim());
      setCreatedCode(code);
      setSessionName('');
    } catch (error) {
      console.error('Start session error:', error);
    } finally {
      setStarting(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError(false);
    try {
      const success = await joinSessionByCode(joinCode.trim());
      if (!success) setJoinError(true);
      else setJoinCode('');
    } catch (error) {
      console.error('Join session error:', error);
      setJoinError(true);
    } finally {
      setJoining(false);
    }
  };

  const handleShareCode = async () => {
    const code = activeSession?.joinCode || createdCode;
    if (!code) return;

    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(code);
    } else {
      await Share.share({ message: code });
    }
  };

  const handleEnd = async () => {
    await endCurrentSession();
    setCreatedCode(null);
  };

  // Active session view
  if (isInSession && activeSession) {
    return (
      <View>
        {/* Session Info */}
        <View style={[styles.sessionCard, { backgroundColor: themeColors.surface }, cardShadow]}>
          <View style={styles.sessionHeader}>
            <View>
              <Text style={[styles.sessionName, { color: themeColors.text }]}>
                {activeSession.name}
              </Text>
              <Text style={[styles.sessionCodeLabel, { color: themeColors.textMuted }]}>
                {t.social.live.sessionCode}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.codeChip, { backgroundColor: themeColors.primarySoft }]}
              onPress={handleShareCode}
            >
              <Text style={[styles.codeChipText, { color: themeColors.primary }]}>
                {activeSession.joinCode}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: themeColors.primary }]}
            onPress={handleShareCode}
          >
            <Text style={styles.shareText}>{t.social.live.shareCode}</Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard */}
        <View style={[styles.leaderboardCard, { backgroundColor: themeColors.surface }, cardShadow]}>
          <Text style={[styles.leaderboardTitle, { color: themeColors.text }]}>
            {t.social.live.leaderboard}
          </Text>
          {participants.map((participant, index) => (
            <LeaderboardCard
              key={participant.uid}
              participant={participant}
              rank={index + 1}
              isMe={participant.uid === user?.uid}
            />
          ))}
        </View>

        {/* End/Leave */}
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
          {activeSession.hostUid === user?.uid ? (
            <TouchableOpacity
              style={[styles.endButton, { backgroundColor: themeColors.dangerSoft }]}
              onPress={handleEnd}
            >
              <Text style={[styles.endText, { color: themeColors.danger }]}>
                {t.social.live.endSession}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.endButton, { backgroundColor: themeColors.surfaceLight }]}
              onPress={leaveSession}
            >
              <Text style={[styles.endText, { color: themeColors.textSecondary }]}>
                {t.social.live.leaveSession}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // No session view
  return (
    <View>
      {/* Start Session */}
      <View style={[styles.card, { backgroundColor: themeColors.surface }, cardShadow]}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>
          {t.social.live.startSession}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: themeColors.surfaceLight,
              color: themeColors.text,
              borderColor: themeColors.border,
            },
          ]}
          placeholder={t.social.live.sessionNamePlaceholder}
          placeholderTextColor={themeColors.textMuted}
          value={sessionName}
          onChangeText={setSessionName}
          maxLength={30}
        />
        <TouchableOpacity
          style={[
            styles.startButton,
            { backgroundColor: themeColors.primary },
            !sessionName.trim() && { opacity: 0.5 },
          ]}
          onPress={handleStart}
          disabled={!sessionName.trim() || starting}
        >
          {starting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.startText}>{t.social.live.startSession}</Text>
          )}
        </TouchableOpacity>

        {createdCode && (
          <TouchableOpacity
            style={[styles.createdCodeBox, { backgroundColor: themeColors.primarySoft }]}
            onPress={handleShareCode}
          >
            <Text style={[styles.createdCodeLabel, { color: themeColors.textSecondary }]}>
              {t.social.live.sessionCode}
            </Text>
            <Text style={[styles.createdCode, { color: themeColors.primary }]}>
              {createdCode}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Join Session */}
      <View style={[styles.card, { backgroundColor: themeColors.surface }, cardShadow]}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>
          {t.social.live.joinSession}
        </Text>
        <View style={styles.joinRow}>
          <TextInput
            style={[
              styles.input,
              styles.joinInput,
              {
                backgroundColor: themeColors.surfaceLight,
                color: themeColors.text,
                borderColor: themeColors.border,
              },
            ]}
            placeholder={t.social.live.joinCodePlaceholder}
            placeholderTextColor={themeColors.textMuted}
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity
            style={[
              styles.joinButton,
              { backgroundColor: themeColors.primary },
              !joinCode.trim() && { opacity: 0.5 },
            ]}
            onPress={handleJoin}
            disabled={!joinCode.trim() || joining}
          >
            {joining ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.joinText}>{t.social.live.joinButton}</Text>
            )}
          </TouchableOpacity>
        </View>
        {joinError && (
          <Text style={[styles.errorText, { color: themeColors.danger }]}>
            {t.social.friends.notFound}
          </Text>
        )}
      </View>

      {/* Empty state hint */}
      {!createdCode && (
        <View style={styles.emptyHint}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            {t.social.live.noSession}
          </Text>
          <Text style={[styles.emptySubtext, { color: themeColors.textMuted }]}>
            {t.social.live.noSessionSubtext}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  startButton: {
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  startText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  createdCodeBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  createdCodeLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  createdCode: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: 3,
  },
  joinRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  joinInput: {
    flex: 1,
    marginBottom: 0,
  },
  joinButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  errorText: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  emptyHint: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  // Active session styles
  sessionCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sessionName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  sessionCodeLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  codeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  codeChipText: {
    fontSize: fontSize.md,
    fontWeight: '800',
    letterSpacing: 2,
  },
  shareButton: {
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  shareText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  leaderboardCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  leaderboardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  endButton: {
    paddingVertical: 14,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
  },
  endText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
