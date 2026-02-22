import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationFinish: () => void;
}

export function AnimatedSplash({ onAnimationFinish }: AnimatedSplashProps) {
  const { themeColors } = useTheme();

  const emojiOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Emoji fades in and scales up
    emojiOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    emojiScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });

    // Title fades in
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(300, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    // Subtitle fades in
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Fade out entire splash
    const finishTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }, () => {
        runOnJS(onAnimationFinish)();
      });
    }, 2500);

    return () => {
      clearTimeout(finishTimer);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    opacity: emojiOpacity.value,
    transform: [{ scale: emojiScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: themeColors.background }, containerStyle]}>
      <View style={styles.content}>
        <Animated.View style={[styles.emojiWrapper, emojiStyle]}>
          <Text style={styles.emoji}>🍺</Text>
        </Animated.View>

        <Animated.Text style={[styles.title, { color: themeColors.text }, titleStyle]}>
          Alcohol Tracker
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { color: themeColors.textSecondary }, subtitleStyle]}>
          Drink smart. Stay sharp.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    marginTop: -40,
  },
  emojiWrapper: {
    width: Math.min(SCREEN_WIDTH * 0.4, 180),
    height: Math.min(SCREEN_WIDTH * 0.4, 180),
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 100,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
