import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import { useTipJar, TipPackage } from '../hooks/useTipJar';
import { spacing, borderRadius, fontSize, shadows } from '../constants/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

const TIP_EMOJIS = ['☕', '🍺', '🍾'];

export function TipJarSection() {
  const { theme, themeColors } = useTheme();
  const { t } = useTranslation();
  const { isAvailable, packages, isPurchasing, showThankYou, purchaseTip } = useTipJar();

  if (!isAvailable) return null;

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;
  const tipLabels = [
    t.settings.tipJar.tipSmall,
    t.settings.tipJar.tipMedium,
    t.settings.tipJar.tipLarge,
  ];

  return (
    <AnimatedView
      entering={FadeInDown.delay(800).duration(500).springify().damping(18)}
      style={[styles.section, { backgroundColor: themeColors.surface }, cardShadow]}
    >
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: '#ec489918' }]}>
          <Text style={styles.sectionIconText}>💝</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          {t.settings.tipJar.title}
        </Text>
      </View>

      <Text style={[styles.description, { color: themeColors.textSecondary }]}>
        {t.settings.tipJar.description}
      </Text>

      {/* Tip buttons */}
      <View style={styles.tipButtons}>
        {packages.map((pkg: TipPackage, index: number) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={[styles.tipButton, { backgroundColor: themeColors.surfaceLight }]}
            onPress={() => purchaseTip(pkg)}
            disabled={isPurchasing}
            activeOpacity={0.7}
          >
            <Text style={styles.tipEmoji}>{TIP_EMOJIS[index] || '🎁'}</Text>
            <Text style={[styles.tipLabel, { color: themeColors.text }]}>
              {tipLabels[index] || pkg.identifier}
            </Text>
            <Text style={[styles.tipPrice, { color: themeColors.primary }]}>
              {isPurchasing ? '...' : pkg.localizedPrice}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading indicator */}
      {isPurchasing && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={themeColors.primary} />
        </View>
      )}

      {/* Disclaimer */}
      <Text style={[styles.disclaimer, { color: themeColors.textMuted }]}>
        {t.settings.tipJar.tipDisclaimer}
      </Text>

      {/* Thank you overlay */}
      {showThankYou && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.thankYouOverlay, { backgroundColor: themeColors.surface + 'F5' }]}
        >
          <Animated.Text
            entering={ZoomIn.delay(100).springify().damping(12)}
            style={styles.thankYouEmoji}
          >
            🎉
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(200).duration(400)}
            style={[styles.thankYouTitle, { color: themeColors.text }]}
          >
            {t.settings.tipJar.thankYouTitle}
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(400).duration(400)}
            style={[styles.thankYouMessage, { color: themeColors.textSecondary }]}
          >
            {t.settings.tipJar.thankYouMessage}
          </Animated.Text>
        </Animated.View>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  description: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  tipButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: 4,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tipPrice: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  loadingRow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  disclaimer: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  thankYouOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
  },
  thankYouEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  thankYouTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  thankYouMessage: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
