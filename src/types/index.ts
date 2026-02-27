export type DrinkType =
  | 'beer' | 'beer_fluitje' | 'beer_vaasje' | 'beer_pint' | 'beer_blikje'
  | 'wine' | 'spirits' | 'cocktail' | 'other';

export interface Drink {
  id: string;
  type: DrinkType;
  timestamp: number; // Unix timestamp in ms
  createdAt: number; // When the entry was actually created
}

export interface WeeklyGoal {
  limit: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  count: number;
  drinks: Drink[];
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  count: number;
  dailyBreakdown: { day: string; count: number }[];
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  count: number;
  weeklyBreakdown: number[];
  dryDays: number;
  totalDays: number;
}

export type ThemeMode = 'dark' | 'light';
export type UserGender = 'male' | 'female' | 'other';
export type Language = 'nl' | 'en';

export interface AppSettings {
  dailyLimit: number;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm
  limitWarningEnabled: boolean;
  userWeight: number | null; // kg
  userGender: UserGender | null;
  waterReminderEnabled: boolean;
  waterReminderInterval: number; // remind every X drinks
  language: Language;
}

export const DEFAULT_SETTINGS: AppSettings = {
  dailyLimit: 3,
  themeMode: 'light',
  notificationsEnabled: false,
  reminderTime: '21:00',
  limitWarningEnabled: false,
  userWeight: null,
  userGender: null,
  waterReminderEnabled: false,
  waterReminderInterval: 2,
  language: 'nl' as Language,
};
