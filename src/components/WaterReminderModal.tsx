import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { impactAsync, ImpactFeedbackStyle } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import { useDrinks } from '../context/DrinkContext';
import { spacing, borderRadius, fontSize, shadows } from '../constants/theme';

interface WaterReminderModalProps {
  visible: boolean;
  onClose: () => void;
}

export function WaterReminderModal({ visible, onClose }: WaterReminderModalProps) {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { waterCount, addWater } = useDrinks();

  const handleLogWater = async () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    await addWater();
    onClose();
  };

  const handleSkip = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    onClose();
  };

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.surface }, cardShadow]}>
          {/* Water icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: '#06b6d418' }]}>
              <Text style={styles.iconText}>💧</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: themeColors.text }]}>
            {t.water.title}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {t.water.subtitle}
          </Text>

          {/* Water count badge */}
          {waterCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: themeColors.primarySoft }]}>
              <Text style={[styles.countText, { color: themeColors.primaryLight }]}>
                {t.water.logged(waterCount)}
              </Text>
            </View>
          )}

          {/* Log water button */}
          <TouchableOpacity onPress={handleLogWater} activeOpacity={0.85}>
            <View style={[styles.logButton, { backgroundColor: '#06b6d4' }]}>
              <Text style={styles.logButtonEmoji}>💧</Text>
              <Text style={styles.logButtonText}>{t.water.logButton}</Text>
            </View>
          </TouchableOpacity>

          {/* Skip button */}
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: themeColors.surfaceLight }]}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipButtonText, { color: themeColors.textMuted }]}>
              {t.water.skipButton}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modal: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  countBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  countText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xxl,
    width: '100%',
    minWidth: 240,
  },
  logButtonEmoji: {
    fontSize: 20,
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  skipButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  skipButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
