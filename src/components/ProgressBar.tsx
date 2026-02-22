import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import { spacing, borderRadius, fontSize } from '../constants/theme';

interface ProgressBarProps {
  current: number;
  max: number;
  height?: number;
  showLabel?: boolean;
}

function getProgressColor(ratio: number): string {
  if (ratio >= 1) return '#ef4444';
  if (ratio >= 0.8) return '#f97316';
  if (ratio >= 0.6) return '#f59e0b';
  return '#F97316';
}

export function ProgressBar({ current, max, height = 14, showLabel = true }: ProgressBarProps) {
  const { themeColors } = useTheme();
  const { t } = useTranslation();
  const progress = useSharedValue(0);
  const ratio = max > 0 ? Math.min(current / max, 1) : 0;
  const progressColor = getProgressColor(ratio);

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.max(progress.value * 100, 2)}%`,
  }));

  return (
    <View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            <Text style={[styles.labelBold, { color: themeColors.text }]}>{current}</Text>
            {' '}{t.components.progressOf}{' '}
            <Text style={[styles.labelBold, { color: themeColors.text }]}>{max}</Text>
            {' '}{t.components.progressToday}
          </Text>
          {current >= max && (
            <View style={[styles.badge, { backgroundColor: themeColors.dangerSoft }]}>
              <Text style={[styles.badgeText, { color: themeColors.danger }]}>
                {t.components.progressLimitReached}
              </Text>
            </View>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            backgroundColor: themeColors.progressBackground,
            height,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            animatedStyle,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    flexShrink: 1,
  },
  labelBold: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
