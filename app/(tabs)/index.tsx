import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  FadeIn,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import { impactAsync, ImpactFeedbackStyle } from '../../src/utils/haptics';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import { useDrinks } from '../../src/context/DrinkContext';
import { useTimer } from '../../src/hooks/useTimer';
import { useBAC } from '../../src/hooks/useBAC';
import { ProgressBar } from '../../src/components/ProgressBar';
import { DrinkLogModal } from '../../src/components/DrinkLogModal';
import { WaterReminderModal } from '../../src/components/WaterReminderModal';
import { drinkEmojis, drinkCalories, spacing, borderRadius, fontSize, shadows } from '../../src/constants/theme';
import { formatDateTime, getDateLocale } from '../../src/utils/date';
import { formatBAC, formatTimeToZero, getBacLevel } from '../../src/utils/bac';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

const SPRING_CONFIG = { damping: 16, stiffness: 140 };

export default function HomeScreen() {
  const router = useRouter();
  const { themeColors, theme } = useTheme();
  const { t, language } = useTranslation();
  const { lastDrink, dailyCount, dailyLimit, dailyCalories, recentDrinks, todayDrinks, settings, addDrink, refreshData } = useDrinks();
  const timerLabels = React.useMemo(() => ({
    noDrinksLogged: t.utils.noDrinksLogged,
    hourWord: t.utils.hourWord,
    dayWord: t.utils.dayWord,
    daysWord: t.utils.daysWord,
  }), [t]);
  const timer = useTimer(lastDrink?.timestamp ?? null, timerLabels);
  const bac = useBAC(todayDrinks, settings);
  const dateLocale = getDateLocale(language);
  const bacLabels = React.useMemo(() => ({
    sober: t.utils.sober,
    hourAbbrev: t.utils.hourAbbrev,
    hourWord: t.utils.hourWord,
  }), [t]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const prevDailyCount = useRef(dailyCount);

  const buttonScale = useSharedValue(1);
  const quickAddScale = useSharedValue(1);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleLogPress = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withSpring(0.93, SPRING_CONFIG),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    setModalVisible(true);
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedQuickAddStyle = useAnimatedStyle(() => ({
    transform: [{ scale: quickAddScale.value }],
  }));

  const handleQuickAdd = async () => {
    if (!lastDrink) return;
    impactAsync(ImpactFeedbackStyle.Medium);
    quickAddScale.value = withSequence(
      withSpring(0.93, SPRING_CONFIG),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    await addDrink(lastDrink.type);
  };

  // Water reminder: watch dailyCount for changes after logging
  useEffect(() => {
    if (dailyCount > prevDailyCount.current && dailyCount > 0) {
      if (
        settings.waterReminderEnabled &&
        dailyCount % settings.waterReminderInterval === 0
      ) {
        setWaterModalVisible(true);
        if (Platform.OS !== 'web') {
          const Notifications = require('expo-notifications');
          Notifications.scheduleNotificationAsync({
            content: {
              title: t.notifications.waterTitle,
              body: t.notifications.waterBody,
              sound: true,
            },
            trigger: null,
          }).catch(() => {});
        }
      }
    }
    prevDailyCount.current = dailyCount;
  }, [dailyCount, settings.waterReminderEnabled, settings.waterReminderInterval]);

  useEffect(() => {
    if (settings.waterReminderEnabled && Platform.OS !== 'web') {
      const Notifications = require('expo-notifications');
      Notifications.requestPermissionsAsync().catch(() => {});
    }
  }, [settings.waterReminderEnabled]);

  const getTimerColor = () => {
    if (!timer.isActive) return themeColors.textMuted;
    if (timer.days > 0) return themeColors.success;
    if (timer.hours >= 12) return themeColors.success;
    if (timer.hours >= 4) return themeColors.warning;
    return themeColors.primary;
  };

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
          }
        >
          {/* Header */}
          <AnimatedView entering={FadeIn.duration(500)}>
            <Text style={[styles.header, { color: themeColors.text }]}>{t.home.title}</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {t.home.subtitle}
            </Text>
          </AnimatedView>

          {/* Timer Card */}
          <AnimatedView
            entering={FadeInDown.delay(100).duration(500).springify().damping(18)}
            style={[
              styles.timerCard,
              { backgroundColor: themeColors.surface },
              cardShadow,
            ]}
          >
            <Text style={[styles.timerLabel, { color: themeColors.textMuted }]}>
              {t.home.timerLabel}
            </Text>
            <Text style={[styles.timerValue, { color: getTimerColor() }]}>
              {timer.text}
            </Text>
            {(timer.isActive && timer.days === 0) && (
              <Text style={[styles.timerSub, { color: themeColors.textMuted }]}>
                {timer.subText}
              </Text>
            )}
            {!timer.isActive && (
              <Text style={[styles.timerSub, { color: themeColors.textMuted }]}>
                {timer.subText}
              </Text>
            )}
            {lastDrink && (
              <View style={[styles.lastDrinkPill, { backgroundColor: themeColors.primarySoft }]}>
                <Text style={[styles.lastDrinkInfo, { color: themeColors.primary }]}>
                  {drinkEmojis[lastDrink.type]} {t.drinks.labels[lastDrink.type]} · {formatDateTime(lastDrink.timestamp, dateLocale)}
                </Text>
              </View>
            )}
          </AnimatedView>

          {/* Daily Progress Card */}
          <AnimatedView
            entering={FadeInDown.delay(200).duration(500).springify().damping(18)}
            style={[
              styles.card,
              { backgroundColor: themeColors.surface },
              cardShadow,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>{t.home.dailyLimit}</Text>
              <View style={[styles.dayBadge, { backgroundColor: themeColors.primarySoft }]}>
                <Text style={[styles.dayBadgeText, { color: themeColors.primary }]}>
                  {t.home.today}
                </Text>
              </View>
            </View>
            <ProgressBar current={dailyCount} max={dailyLimit} />
          </AnimatedView>

          {/* Calories Card */}
          <AnimatedView
            entering={FadeInDown.delay(300).duration(500).springify().damping(18)}
            style={[
              styles.card,
              { backgroundColor: themeColors.surface },
              cardShadow,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>{t.home.caloriesTitle}</Text>
            </View>
            <View style={styles.calorieRow}>
              <Text style={[styles.calorieValue, { color: themeColors.primary }]}>
                {dailyCalories}
              </Text>
              <Text style={[styles.calorieUnit, { color: themeColors.textSecondary }]}>
                kcal
              </Text>
            </View>
            {dailyCount > 0 && (
              <Text style={[styles.calorieAvg, { color: themeColors.textMuted }]}>
                {t.home.caloriesAvg(Math.round(dailyCalories / dailyCount))}
              </Text>
            )}
          </AnimatedView>

          {/* BAC Card */}
          {!bac.isConfigured ? (
            <AnimatedView entering={FadeInDown.delay(400).duration(500).springify().damping(18)}>
              <TouchableOpacity
                style={[
                  styles.card,
                  { backgroundColor: themeColors.surface },
                  cardShadow,
                ]}
                onPress={() => router.push('/(tabs)/settings')}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: themeColors.text }]}>{t.home.bacTitle}</Text>
                </View>
                <Text style={[styles.bacSetupText, { color: themeColors.textSecondary }]}>
                  {t.home.bacSetupText}
                </Text>
                <View style={[styles.bacSetupButton, { backgroundColor: themeColors.primarySoft }]}>
                  <Text style={[styles.bacSetupButtonText, { color: themeColors.primary }]}>
                    {t.home.bacSetupButton}
                  </Text>
                </View>
              </TouchableOpacity>
            </AnimatedView>
          ) : (
            <AnimatedView
              entering={FadeInDown.delay(400).duration(500).springify().damping(18)}
              style={[
                styles.card,
                { backgroundColor: themeColors.surface },
                cardShadow,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: themeColors.text }]}>{t.home.bacTitle}</Text>
                {bac.trend !== 'zero' && (
                  <View style={[styles.dayBadge, {
                    backgroundColor: bac.trend === 'rising' ? themeColors.dangerSoft : themeColors.successSoft,
                  }]}>
                    <Text style={[styles.dayBadgeText, {
                      color: bac.trend === 'rising' ? themeColors.danger : themeColors.success,
                    }]}>
                      {bac.trend === 'rising' ? t.home.bacTrendRising : t.home.bacTrendDeclining}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.bacRow}>
                <Text style={[
                  styles.bacValue,
                  {
                    color: getBacLevel(bac.bac) === 'zero' ? themeColors.textMuted
                      : getBacLevel(bac.bac) === 'low' ? themeColors.success
                      : getBacLevel(bac.bac) === 'moderate' ? themeColors.warning
                      : themeColors.danger,
                  },
                ]}>
                  {formatBAC(bac.bac)}%
                </Text>
              </View>
              {bac.bac > 0 && (
                <Text style={[styles.bacTimeToZero, { color: themeColors.textMuted }]}>
                  {t.home.bacSoberIn(formatTimeToZero(bac.timeToZeroMinutes, bacLabels))}
                </Text>
              )}
              {bac.bac === 0 && dailyCount > 0 && (
                <Text style={[styles.bacTimeToZero, { color: themeColors.textMuted }]}>
                  {t.home.bacSoberAgain}
                </Text>
              )}
              <Text style={[styles.bacDisclaimer, { color: themeColors.textMuted }]}>
                {t.home.bacDisclaimer}
              </Text>
            </AnimatedView>
          )}

          {/* Log Buttons */}
          <AnimatedView entering={FadeInDown.delay(500).duration(500).springify().damping(18)}>
            {lastDrink ? (
              <View style={styles.logButtonRow}>
                <AnimatedTouchable
                  onPress={handleQuickAdd}
                  activeOpacity={0.85}
                  style={[animatedQuickAddStyle, shadows.button, styles.quickAddWrapper]}
                >
                  <View style={[styles.quickAddButton, { backgroundColor: themeColors.primary }]}>
                    <Text style={styles.quickAddEmoji}>{drinkEmojis[lastDrink.type]}</Text>
                    <Text style={styles.quickAddText} numberOfLines={1}>
                      {t.drinks.labels[lastDrink.type]}
                    </Text>
                    <Text style={styles.quickAddPlus}>+</Text>
                  </View>
                </AnimatedTouchable>
                <AnimatedTouchable
                  onPress={handleLogPress}
                  activeOpacity={0.85}
                  style={[animatedButtonStyle, shadows.button, styles.logNewWrapper]}
                >
                  <View style={[styles.logButton, { backgroundColor: themeColors.primary }]}>
                    <Text style={styles.logButtonEmoji}>🍺</Text>
                    <Text style={styles.logButtonText}>{t.home.logDrink}</Text>
                  </View>
                </AnimatedTouchable>
              </View>
            ) : (
              <AnimatedTouchable
                onPress={handleLogPress}
                activeOpacity={0.85}
                style={[animatedButtonStyle, shadows.button]}
              >
                <View style={[styles.logButton, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.logButtonEmoji}>🍺</Text>
                  <Text style={styles.logButtonText}>{t.home.logADrink}</Text>
                </View>
              </AnimatedTouchable>
            )}
          </AnimatedView>

          {/* Recent Drinks */}
          {recentDrinks.length > 0 && (
            <AnimatedView
              entering={FadeInDown.delay(600).duration(500).springify().damping(18)}
              style={[
                styles.card,
                { backgroundColor: themeColors.surface },
                cardShadow,
              ]}
            >
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                {t.home.recentTitle}
              </Text>
              {recentDrinks.slice(0, 5).map((drink, index) => (
                <View
                  key={drink.id}
                  style={[
                    styles.recentItem,
                    index < Math.min(recentDrinks.length, 5) - 1 && {
                      borderBottomColor: themeColors.border,
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View style={styles.recentLeft}>
                    <View style={[
                      styles.recentIconBg,
                      { backgroundColor: themeColors.primarySoft },
                    ]}>
                      <Text style={styles.recentEmoji}>{drinkEmojis[drink.type]}</Text>
                    </View>
                    <View>
                      <Text style={[styles.recentType, { color: themeColors.text }]}>
                        {t.drinks.labels[drink.type]}
                      </Text>
                      <Text style={[styles.recentTime, { color: themeColors.textMuted }]}>
                        {formatDateTime(drink.timestamp, dateLocale)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.recentCalories, { color: themeColors.textSecondary }]}>
                    {drinkCalories[drink.type] || 150} kcal
                  </Text>
                </View>
              ))}
            </AnimatedView>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>

      <DrinkLogModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <WaterReminderModal visible={waterModalVisible} onClose={() => setWaterModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
  },
  timerCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  timerValue: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  timerSub: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  lastDrinkPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
  },
  lastDrinkInfo: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  dayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  dayBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  calorieValue: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  calorieUnit: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  calorieAvg: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  logButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickAddWrapper: {
    flex: 0.4,
  },
  logNewWrapper: {
    flex: 0.6,
  },
  quickAddButton: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  quickAddEmoji: {
    fontSize: 20,
  },
  quickAddText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '700',
    flexShrink: 1,
  },
  quickAddPlus: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  logButton: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  logButtonEmoji: {
    fontSize: 26,
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  recentIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentEmoji: {
    fontSize: 20,
  },
  recentType: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  recentTime: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  recentCalories: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  bacSetupText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  bacSetupButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  bacSetupButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  bacRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  bacValue: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  bacTimeToZero: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  bacDisclaimer: {
    fontSize: 10,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
