import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  eachDayOfInterval,
  eachWeekOfInterval,
  isSameDay,
  subWeeks,
  subMonths,
  startOfDay,
  endOfDay,
  addDays,
} from 'date-fns';
import { nl } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import type { Language } from '../types';

const dateFnsLocales: Record<Language, Locale> = { nl, en: enUS };

export function getDateLocale(language: Language): Locale {
  return dateFnsLocales[language] || nl;
}

// Week runs Monday to Sunday
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  // Make end inclusive to the end of Sunday
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

interface TimeSinceLabels {
  hourWord: string;
  dayWord: string;
  daysWord: string;
}

export function formatTimeSince(
  timestamp: number,
  labels?: TimeSinceLabels,
): {
  text: string;
  subText: string;
  days: number;
  hours: number;
  minutes: number;
} {
  const l = labels || { hourWord: 'uur', dayWord: 'dag', daysWord: 'dagen' };
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 0) {
    return { text: '0:00', subText: l.hourWord, days: 0, hours: 0, minutes: 0 };
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return {
      text: `${days}d ${hours}u ${minutes.toString().padStart(2, '0')}m`,
      subText: days === 1 ? l.dayWord : l.daysWord,
      days,
      hours,
      minutes,
    };
  }

  return {
    text: `${hours}:${minutes.toString().padStart(2, '0')}`,
    subText: l.hourWord,
    days: 0,
    hours,
    minutes,
  };
}

export function formatDate(timestamp: number, locale?: Locale): string {
  return format(new Date(timestamp), 'd MMM yyyy', { locale: locale || nl });
}

export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'HH:mm');
}

export function formatDateTime(timestamp: number, locale?: Locale): string {
  return format(new Date(timestamp), 'd MMM HH:mm', { locale: locale || nl });
}

export function formatDayShort(date: Date, locale?: Locale): string {
  return format(date, 'EEE', { locale: locale || nl });
}

export function formatDayOfMonth(date: Date): string {
  return format(date, 'd');
}

export function formatMonthYear(date: Date, locale?: Locale): string {
  return format(date, 'MMMM yyyy', { locale: locale || nl });
}

export function formatWeekLabel(date: Date, locale?: Locale): string {
  const end = addDays(date, 6);
  return `${format(date, 'd MMM', { locale: locale || nl })} - ${format(end, 'd MMM', { locale: locale || nl })}`;
}

export function getDaysInRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export function getWeeksInRange(start: Date, end: Date): Date[] {
  return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
}

export function isSameDayCheck(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

export function getDayStart(date: Date): Date {
  return startOfDay(date);
}

export function getDayEnd(date: Date): Date {
  return endOfDay(date);
}

export function getPreviousWeeks(count: number): { start: Date; end: Date }[] {
  const weeks: { start: Date; end: Date }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = subWeeks(now, i);
    weeks.push(getWeekRange(date));
  }

  return weeks.reverse();
}

export function getPreviousMonths(count: number): { start: Date; end: Date; date: Date }[] {
  const months: { start: Date; end: Date; date: Date }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = subMonths(now, i);
    months.push({
      ...getMonthRange(date),
      date,
    });
  }

  return months.reverse();
}
