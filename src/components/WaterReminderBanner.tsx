import React, { useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import { spacing, borderRadius, fontSize } from '../constants/theme';

interface WaterReminderBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

export function WaterReminderBanner({ visible, onDismiss }: WaterReminderBannerProps) {
  const { themeColors } = useTheme();
  const { t } = useTranslation();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Slide in, hold for 5s, then auto-dismiss
      translateY.value = withSequence(
        withTiming(0, { duration: 400, easing: Easing.out(Easing.back(1.2)) }),
        withDelay(5000, withTiming(-100, { duration: 300 }, (finished) => {
          if (finished) runOnJS(onDismiss)();
        }))
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(5000, withTiming(0, { duration: 300 }))
      );
    } else {
      translateY.value = -100;
      opacity.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleDismiss = () => {
    translateY.value = withTiming(-100, { duration: 250 }, (finished) => {
      if (finished) runOnJS(onDismiss)();
    });
    opacity.value = withTiming(0, { duration: 250 });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity onPress={handleDismiss} activeOpacity={0.9}>
        <LinearGradient
          colors={['#06b6d4', '#0891b2'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <Text style={styles.emoji}>💧</Text>
          <Text style={styles.text}>{t.components.waterBanner}</Text>
          <Text style={[styles.dismiss, { color: 'rgba(255,255,255,0.6)' }]}>✕</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 24,
  },
  text: {
    flex: 1,
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  dismiss: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
