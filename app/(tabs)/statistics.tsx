import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import { useDrinks } from '../../src/context/DrinkContext';
import { calculatePeakBAC, formatBAC } from '../../src/utils/bac';
import { drinkCalories, spacing, borderRadius, fontSize, shadows } from '../../src/constants/theme';
import {
  getPreviousWeeks,
  getPreviousMonths,
  formatMonthYear,
  getDaysInRange,
  getMonthRange,
  getDayStart,
  getDayEnd,
} from '../../src/utils/date';
import { getDrinkCountForRange } from '../../src/database/database';
import { startOfDay, differenceInCalendarDays, subDays } from 'date-fns';

const screenWidth = Dimensions.get('window').width - spacing.lg * 2;

const AnimatedView = Animated.createAnimatedComponent(View);

interface StatsData {
  weeklyData: number[];
  weeklyLabels: string[];
  monthlyData: number[];
  monthlyLabels: string[];
  avgPerWeek: number;
  avgCaloriesPerDay: number;
  totalCaloriesThisWeek: number;
  longestStreak: number;
  currentStreak: number;
  dryDaysThisMonth: number;
  totalDaysThisMonth: number;
  highestBacThisMonth: number;
  avgBacPerDrinkingDay: number;
}

export default function StatisticsScreen() {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { getDrinksForRange, refreshData, settings } = useDrinks();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const weeks = getPreviousWeeks(8);
      const weeklyData: number[] = [];
      const weeklyLabels: string[] = [];
      for (const week of weeks) {
        const count = await getDrinkCountForRange(week.start.getTime(), week.end.getTime());
        weeklyData.push(count);
        weeklyLabels.push(`W${weeks.indexOf(week) + 1}`);
      }

      const months = getPreviousMonths(6);
      const monthlyData: number[] = [];
      const monthlyLabels: string[] = [];
      for (const month of months) {
        const count = await getDrinkCountForRange(month.start.getTime(), month.end.getTime() + 86400000);
        monthlyData.push(count);
        monthlyLabels.push(formatMonthYear(month.date).substring(0, 3));
      }

      const totalWeekly = weeklyData.reduce((a, b) => a + b, 0);
      const avgPerWeek = weeklyData.length > 0 ? Math.round((totalWeekly / weeklyData.length) * 10) / 10 : 0;

      const today = new Date();
      const ninetyDaysAgo = subDays(today, 90);
      const allDrinks = await getDrinksForRange(ninetyDaysAgo.getTime(), Date.now());
      const drinkDates = new Set<string>();
      allDrinks.forEach((d) => {
        drinkDates.add(startOfDay(new Date(d.timestamp)).toISOString());
      });

      const currentWeek = weeks[weeks.length - 1];
      const thisWeekDrinks = currentWeek
        ? await getDrinksForRange(currentWeek.start.getTime(), currentWeek.end.getTime())
        : [];
      const totalCaloriesThisWeek = thisWeekDrinks.reduce(
        (total, drink) => total + (drinkCalories[drink.type] || 150),
        0
      );

      const thirtyDaysAgo = subDays(today, 30);
      const last30DaysDrinks = await getDrinksForRange(thirtyDaysAgo.getTime(), Date.now());
      const drinkingDaysSet = new Set<string>();
      let totalCalories30Days = 0;
      last30DaysDrinks.forEach((d) => {
        drinkingDaysSet.add(startOfDay(new Date(d.timestamp)).toISOString());
        totalCalories30Days += drinkCalories[d.type] || 150;
      });
      const drinkingDaysCount = drinkingDaysSet.size;
      const avgCaloriesPerDay = drinkingDaysCount > 0
        ? Math.round(totalCalories30Days / drinkingDaysCount)
        : 0;

      let longestStreak = 0;
      let currentStreak = 0;
      let tempStreak = 0;
      for (let i = 0; i <= 90; i++) {
        const dayKey = startOfDay(subDays(today, i)).toISOString();
        if (!drinkDates.has(dayKey)) {
          tempStreak++;
          if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
        } else {
          if (i === 0) currentStreak = 0;
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      const { start: monthStart, end: monthEnd } = getMonthRange(today);
      const daysInMonth = getDaysInRange(monthStart, today);
      let dryDaysThisMonth = 0;
      for (const day of daysInMonth) {
        if (!drinkDates.has(startOfDay(day).toISOString())) dryDaysThisMonth++;
      }

      let highestBacThisMonth = 0;
      let avgBacPerDrinkingDay = 0;
      if (settings.userWeight && settings.userGender) {
        const monthDrinks = await getDrinksForRange(monthStart.getTime(), monthEnd.getTime() + 86400000);
        const dayBuckets: Record<string, typeof monthDrinks> = {};
        monthDrinks.forEach((d) => {
          const key = startOfDay(new Date(d.timestamp)).toISOString();
          if (!dayBuckets[key]) dayBuckets[key] = [];
          dayBuckets[key].push(d);
        });

        let totalPeakBac = 0;
        let drinkingDays = 0;
        for (const dayDrinks of Object.values(dayBuckets)) {
          if (dayDrinks.length > 0) {
            const peak = calculatePeakBAC(dayDrinks, settings.userWeight!, settings.userGender!);
            highestBacThisMonth = Math.max(highestBacThisMonth, peak);
            totalPeakBac += peak;
            drinkingDays++;
          }
        }
        avgBacPerDrinkingDay = drinkingDays > 0
          ? Math.round((totalPeakBac / drinkingDays) * 1000) / 1000
          : 0;
      }

      setStats({
        weeklyData,
        weeklyLabels,
        monthlyData,
        monthlyLabels,
        avgPerWeek,
        avgCaloriesPerDay,
        totalCaloriesThisWeek,
        longestStreak,
        currentStreak,
        dryDaysThisMonth,
        totalDaysThisMonth: differenceInCalendarDays(monthEnd, monthStart) + 1,
        highestBacThisMonth,
        avgBacPerDrinkingDay,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [getDrinksForRange, settings]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), refreshData()]);
    setRefreshing(false);
  }, [loadStats, refreshData]);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: themeColors.surfaceSolid,
    backgroundGradientTo: themeColors.surfaceSolid,
    decimalCount: 0,
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
    labelColor: () => themeColors.textSecondary,
    style: { borderRadius: borderRadius.lg },
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#F97316' },
    propsForBackgroundLines: { strokeDasharray: '', stroke: themeColors.border, strokeWidth: 0.5 },
    barPercentage: 0.6,
  };

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  const metricCards = stats ? [
    { emoji: '📊', value: String(stats.avgPerWeek), label: t.statistics.avgPerWeek, color: '#F97316' },
    { emoji: '🔥', value: String(stats.currentStreak), label: t.statistics.dryDaysStreak, color: '#10b981' },
    { emoji: '🏆', value: String(stats.longestStreak), label: t.statistics.longestStreak, color: '#f59e0b' },
    { emoji: '💧', value: `${stats.dryDaysThisMonth}/${stats.totalDaysThisMonth}`, label: t.statistics.dryDaysMonth, color: '#ec4899' },
    { emoji: '🍕', value: `${stats.totalCaloriesThisWeek}`, label: t.statistics.caloriesThisWeek, color: '#f97316' },
    { emoji: '📈', value: `${stats.avgCaloriesPerDay}`, label: t.statistics.avgCaloriesPerDrinkDay, color: '#ef4444' },
    ...(settings.userWeight && settings.userGender ? [
      { emoji: '🧪', value: formatBAC(stats.highestBacThisMonth), label: t.statistics.highestBacMonth, color: '#06b6d4' },
      { emoji: '⚗️', value: formatBAC(stats.avgBacPerDrinkingDay), label: t.statistics.avgBacPerDrinkDay, color: '#8b5cf6' },
    ] : []),
  ] : [];

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: themeColors.text }]}>{t.statistics.title}</Text>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: themeColors.textMuted }]}>{t.statistics.loading}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
          }
        >
          <AnimatedView entering={FadeIn.duration(500)} style={styles.headerContainer}>
            <Text style={[styles.header, { color: themeColors.text }]}>{t.statistics.title}</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {t.statistics.subtitle}
            </Text>
          </AnimatedView>

          {/* Key metrics */}
          <View style={styles.metricsGrid}>
            {metricCards.map((card, index) => (
              <AnimatedView
                key={index}
                entering={FadeInDown.delay(100 + index * 60).duration(500).springify().damping(18)}
                style={[
                  styles.metricCard,
                  { backgroundColor: themeColors.surface },
                  cardShadow,
                ]}
              >
                <View style={[styles.metricEmojiContainer, { backgroundColor: card.color + '18' }]}>
                  <Text style={styles.metricEmoji}>{card.emoji}</Text>
                </View>
                <Text style={[styles.metricValue, { color: themeColors.text }]}>
                  {card.value}
                </Text>
                <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>
                  {card.label}
                </Text>
              </AnimatedView>
            ))}
          </View>

          {/* Weekly chart */}
          <AnimatedView
            entering={FadeInDown.delay(600).duration(500).springify().damping(18)}
            style={[
              styles.chartCard,
              { backgroundColor: themeColors.surface },
              cardShadow,
            ]}
          >
            <Text style={[styles.chartTitle, { color: themeColors.text }]}>
              {t.statistics.weeklyOverview}
            </Text>
            <Text style={[styles.chartSubtitle, { color: themeColors.textSecondary }]}>
              {t.statistics.weeklySubtitle}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={{
                  labels: stats.weeklyLabels,
                  datasets: [{ data: stats.weeklyData.length > 0 ? stats.weeklyData : [0] }],
                }}
                width={Math.max(screenWidth - spacing.md, stats.weeklyLabels.length * 50)}
                height={200}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars
                withInnerLines={false}
                yAxisLabel=""
                yAxisSuffix=""
              />
            </ScrollView>
          </AnimatedView>

          {/* Monthly chart */}
          <AnimatedView
            entering={FadeInDown.delay(700).duration(500).springify().damping(18)}
            style={[
              styles.chartCard,
              { backgroundColor: themeColors.surface },
              cardShadow,
            ]}
          >
            <Text style={[styles.chartTitle, { color: themeColors.text }]}>
              {t.statistics.monthlyOverview}
            </Text>
            <Text style={[styles.chartSubtitle, { color: themeColors.textSecondary }]}>
              {t.statistics.monthlySubtitle}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: stats.monthlyLabels,
                  datasets: [{ data: stats.monthlyData.length > 0 ? stats.monthlyData : [0] }],
                }}
                width={Math.max(screenWidth - spacing.md, stats.monthlyLabels.length * 60)}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  propsForDots: { r: '6', strokeWidth: '2', stroke: '#10b981' },
                }}
                style={styles.chart}
                bezier
                fromZero
                withInnerLines={false}
                yAxisLabel=""
                yAxisSuffix=""
              />
            </ScrollView>
          </AnimatedView>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { fontSize: fontSize.md },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  metricEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricEmoji: {
    fontSize: 20,
  },
  metricValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  chartSubtitle: {
    fontSize: fontSize.xs,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.lg,
    marginLeft: -spacing.md,
  },
});
