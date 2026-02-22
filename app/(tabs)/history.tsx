import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import { useDrinks } from '../../src/context/DrinkContext';
import { Drink } from '../../src/types';
import { calculatePeakBAC, formatBAC, getBacLevel } from '../../src/utils/bac';
import {
  drinkEmojis,
  drinkCalories,
  spacing,
  borderRadius,
  fontSize,
  shadows,
} from '../../src/constants/theme';
import {
  formatTime,
  formatMonthYear,
  getDaysInRange,
  getMonthRange,
  getDayStart,
  getDayEnd,
  formatDayOfMonth,
  isSameDayCheck,
  getDateLocale,
} from '../../src/utils/date';
import { addMonths, subMonths, startOfWeek, endOfWeek, isToday, format } from 'date-fns';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function HistoryScreen() {
  const { themeColors, theme } = useTheme();
  const { t, language } = useTranslation();
  const { getDrinksForRange, removeDrink, refreshData, settings } = useDrinks();
  const dateLocale = getDateLocale(language);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayDrinks, setSelectedDayDrinks] = useState<Drink[]>([]);
  const [monthDrinkDates, setMonthDrinkDates] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const loadMonthData = useCallback(async () => {
    const { start, end } = getMonthRange(currentMonth);
    const calStart = startOfWeek(start, { weekStartsOn: 1 });
    const calEnd = endOfWeek(end, { weekStartsOn: 1 });
    const drinks = await getDrinksForRange(calStart.getTime(), calEnd.getTime() + 86400000);
    const dates = new Set<string>();
    drinks.forEach((d) => {
      const date = new Date(d.timestamp);
      dates.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
    });
    setMonthDrinkDates(dates);
  }, [currentMonth, getDrinksForRange]);

  const loadSelectedDayDrinks = useCallback(async () => {
    const start = getDayStart(selectedDate);
    const end = getDayEnd(selectedDate);
    const drinks = await getDrinksForRange(start.getTime(), end.getTime() + 1);
    setSelectedDayDrinks(drinks);
  }, [selectedDate, getDrinksForRange]);

  useEffect(() => { loadMonthData(); }, [loadMonthData]);
  useEffect(() => { loadSelectedDayDrinks(); }, [loadSelectedDayDrinks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadMonthData(), loadSelectedDayDrinks(), refreshData()]);
    setRefreshing(false);
  }, [loadMonthData, loadSelectedDayDrinks, refreshData]);

  const handleDeleteDrink = (drink: Drink) => {
    const drinkLabel = (t.drinks.labels[drink.type] || drink.type).toLowerCase();
    Alert.alert(
      t.history.deleteDrinkTitle,
      t.history.deleteDrinkMessage(drinkLabel),
      [
        { text: t.history.cancel, style: 'cancel' },
        {
          text: t.history.delete,
          style: 'destructive',
          onPress: async () => {
            await removeDrink(drink.id);
            await loadSelectedDayDrinks();
            await loadMonthData();
          },
        },
      ]
    );
  };

  const { start: monthStart, end: monthEnd } = getMonthRange(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = getDaysInRange(calendarStart, calendarEnd);
  const dayNames = t.history.dayNames;

  const hasDrinks = (date: Date) =>
    monthDrinkDates.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();

  const selectedDateLabel = isToday(selectedDate)
    ? t.history.today
    : format(selectedDate, 'd MMMM', { locale: dateLocale });

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

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
            <Text style={[styles.header, { color: themeColors.text }]}>{t.history.title}</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {t.history.subtitle}
            </Text>
          </AnimatedView>

          {/* Calendar */}
          <AnimatedView
            entering={FadeInDown.delay(100).duration(500).springify().damping(18)}
            style={[
              styles.calendarCard,
              { backgroundColor: themeColors.surface },
              cardShadow,
            ]}
          >
            <View style={styles.monthNav}>
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: themeColors.primarySoft }]}
                onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <Text style={[styles.navArrow, { color: themeColors.primary }]}>‹</Text>
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: themeColors.text }]}>
                {formatMonthYear(currentMonth, dateLocale)}
              </Text>
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: themeColors.primarySoft }]}
                onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <Text style={[styles.navArrow, { color: themeColors.primary }]}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dayNamesRow}>
              {dayNames.map((name) => (
                <Text key={name} style={[styles.dayName, { color: themeColors.textMuted }]}>
                  {name}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                const selected = isSameDayCheck(day, selectedDate);
                const today = isToday(day);
                const inMonth = isCurrentMonth(day);
                const drinkDay = hasDrinks(day);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.calendarDay]}
                    onPress={() => setSelectedDate(day)}
                  >
                    <View style={[
                      styles.dayInner,
                      selected && { backgroundColor: themeColors.primary },
                      today && !selected && {
                        borderWidth: 2,
                        borderColor: themeColors.primary,
                      },
                    ]}>
                      <Text style={[
                        styles.dayText,
                        {
                          color: selected
                            ? '#ffffff'
                            : inMonth
                            ? themeColors.text
                            : themeColors.textMuted + '40',
                        },
                        selected && { fontWeight: '700' },
                      ]}>
                        {formatDayOfMonth(day)}
                      </Text>
                    </View>
                    {drinkDay && (
                      <View style={[
                        styles.drinkDot,
                        { backgroundColor: selected ? themeColors.primary : themeColors.accent },
                      ]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </AnimatedView>

          {/* Selected day drinks */}
          <AnimatedView
            entering={FadeInDown.delay(200).duration(500).springify().damping(18)}
            style={[
              styles.dayDrinks,
              { backgroundColor: themeColors.surface },
              cardShadow,
            ]}
          >
            <View style={styles.dayHeader}>
              <Text style={[styles.dayDrinksTitle, { color: themeColors.text }]}>
                {selectedDateLabel}
              </Text>
              <View style={styles.dayHeaderRight}>
                {selectedDayDrinks.length > 0 && settings.userWeight && settings.userGender && (() => {
                  const peakBac = calculatePeakBAC(selectedDayDrinks, settings.userWeight!, settings.userGender!);
                  const level = getBacLevel(peakBac);
                  if (peakBac <= 0) return null;
                  return (
                    <View style={[styles.calorieBadge, {
                      backgroundColor: level === 'low' ? themeColors.successSoft
                        : level === 'moderate' ? themeColors.warningSoft
                        : themeColors.dangerSoft,
                    }]}>
                      <Text style={[styles.calorieBadgeText, {
                        color: level === 'low' ? themeColors.success
                          : level === 'moderate' ? themeColors.warning
                          : themeColors.danger,
                      }]}>
                        🧪 {formatBAC(peakBac)}%
                      </Text>
                    </View>
                  );
                })()}
                {selectedDayDrinks.length > 0 && (
                  <View style={[styles.calorieBadge, { backgroundColor: themeColors.warningSoft }]}>
                    <Text style={[styles.calorieBadgeText, { color: themeColors.warning }]}>
                      🔥 {selectedDayDrinks.reduce((t, d) => t + (drinkCalories[d.type] || 150), 0)} kcal
                    </Text>
                  </View>
                )}
                <View style={[styles.countBadge, { backgroundColor: themeColors.primarySoft }]}>
                  <Text style={[styles.countBadgeText, { color: themeColors.primary }]}>
                    {selectedDayDrinks.length} {selectedDayDrinks.length === 1 ? t.history.drinkSingular : t.history.drinkPlural}
                  </Text>
                </View>
              </View>
            </View>

            {selectedDayDrinks.length === 0 ? (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                  {t.history.noDrinks}
                </Text>
                <Text style={[styles.emptySubText, { color: themeColors.textMuted }]}>
                  {t.history.noDrinksSubtext}
                </Text>
              </View>
            ) : (
              selectedDayDrinks.map((drink, index) => (
                <TouchableOpacity
                  key={drink.id}
                  style={[
                    styles.drinkItem,
                    index < selectedDayDrinks.length - 1 && {
                      borderBottomColor: themeColors.border,
                      borderBottomWidth: 1,
                    },
                  ]}
                  onLongPress={() => handleDeleteDrink(drink)}
                  activeOpacity={0.7}
                >
                  <View style={styles.drinkLeft}>
                    <View style={[styles.drinkIconBg, { backgroundColor: themeColors.primarySoft }]}>
                      <Text style={styles.drinkEmoji}>{drinkEmojis[drink.type]}</Text>
                    </View>
                    <View>
                      <Text style={[styles.drinkType, { color: themeColors.text }]}>
                        {t.drinks.labels[drink.type] || drink.type}
                      </Text>
                      <Text style={[styles.drinkTime, { color: themeColors.textMuted }]}>
                        {formatTime(drink.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.drinkRight}>
                    <Text style={[styles.drinkCalories, { color: themeColors.textSecondary }]}>
                      {drinkCalories[drink.type] || 150} kcal
                    </Text>
                    <Text style={[styles.deleteHint, { color: themeColors.textMuted }]}>
                      ✕
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
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
  calendarCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 24,
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 3,
  },
  dayInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  drinkDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  dayDrinks: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  calorieBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  calorieBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  dayDrinksTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  countBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  countBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  emptyDay: {
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
  emptySubText: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  drinkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  drinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  drinkIconBg: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkEmoji: {
    fontSize: 22,
  },
  drinkType: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  drinkTime: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  drinkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  drinkCalories: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  deleteHint: {
    fontSize: fontSize.md,
    opacity: 0.4,
  },
});
