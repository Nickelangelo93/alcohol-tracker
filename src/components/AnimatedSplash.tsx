import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
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
  const lottieRef = useRef<LottieView>(null);

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const lottieOpacity = useSharedValue(0);
  const lottieScale = useSharedValue(0.8);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Sequence: Lottie fades in → title fades in → subtitle fades in → animation plays → fade out
    lottieOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    lottieScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });

    titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(300, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Start Lottie playback after a brief pause
    const playTimer = setTimeout(() => {
      lottieRef.current?.play();
    }, 400);

    // Fade out entire splash after animation completes
    const finishTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }, () => {
        runOnJS(onAnimationFinish)();
      });
    }, 3800);

    return () => {
      clearTimeout(playTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const lottieStyle = useAnimatedStyle(() => ({
    opacity: lottieOpacity.value,
    transform: [{ scale: lottieScale.value }],
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
        <Animated.View style={[styles.lottieWrapper, lottieStyle]}>
          <LottieView
            ref={lottieRef}
            source={require('../../assets/splash-animation.json')}
            style={styles.lottie}
            autoPlay={false}
            loop={false}
            speed={1}
          />
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    marginTop: -40,
  },
  lottieWrapper: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    marginBottom: spacing.xl,
  },
  lottie: {
    width: '100%',
    height: '100%',
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
