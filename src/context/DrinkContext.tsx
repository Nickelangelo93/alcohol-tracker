import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Drink, DrinkType, AppSettings, DEFAULT_SETTINGS } from '../types';
import {
  addDrink as dbAddDrink,
  deleteDrink as dbDeleteDrink,
  getDrinks,
  getLastDrink,
  getDrinkCountForRange,
  getAppSettings,
  saveAppSettings,
  getTodayWaterCount,
  addWater as dbAddWater,
} from '../database/database';
import { getDayStart, getDayEnd } from '../utils/date';
import { drinkCalories } from '../constants/theme';

interface DrinkContextType {
  lastDrink: Drink | null;
  dailyCount: number;
  dailyLimit: number;
  dailyCalories: number;
  todayDrinks: Drink[];
  recentDrinks: Drink[];
  settings: AppSettings;
  isLoading: boolean;
  waterCount: number;
  addDrink: (type: DrinkType, timestamp?: number) => Promise<Drink>;
  addWater: () => Promise<number>;
  removeDrink: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  getDrinksForRange: (start: number, end: number) => Promise<Drink[]>;
}

const DrinkContext = createContext<DrinkContextType | null>(null);

export function DrinkProvider({ children }: { children: React.ReactNode }) {
  const [lastDrink, setLastDrink] = useState<Drink | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [todayDrinks, setTodayDrinks] = useState<Drink[]>([]);
  const [recentDrinks, setRecentDrinks] = useState<Drink[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [waterCount, setWaterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [last, appSettings, todayWater] = await Promise.all([
        getLastDrink(),
        getAppSettings(),
        getTodayWaterCount(),
      ]);

      setWaterCount(todayWater);

      setLastDrink(last);
      setSettings(appSettings);

      // Get today's drinks for daily count, calories, and BAC
      const today = new Date();
      const dayStart = getDayStart(today);
      const dayEnd = getDayEnd(today);
      const todaysDrinks = await getDrinks(dayStart.getTime(), dayEnd.getTime() + 1);
      setTodayDrinks(todaysDrinks);
      setDailyCount(todaysDrinks.length);

      // Calculate today's calories
      const calories = todaysDrinks.reduce(
        (total, drink) => total + (drinkCalories[drink.type] || 150),
        0
      );
      setDailyCalories(calories);

      // Get recent drinks (last 7 days)
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const recent = await getDrinks(sevenDaysAgo, now);
      setRecentDrinks(recent.slice(0, 10));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addDrink = useCallback(async (type: DrinkType, timestamp?: number): Promise<Drink> => {
    const drink = await dbAddDrink(type, timestamp);
    await refreshData();
    return drink;
  }, [refreshData]);

  const addWater = useCallback(async (): Promise<number> => {
    const newCount = await dbAddWater();
    setWaterCount(newCount);
    return newCount;
  }, []);

  const removeDrink = useCallback(async (id: string) => {
    await dbDeleteDrink(id);
    await refreshData();
  }, [refreshData]);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveAppSettings(updated);
  }, [settings]);

  const getDrinksForRange = useCallback(async (start: number, end: number): Promise<Drink[]> => {
    return getDrinks(start, end);
  }, []);

  return (
    <DrinkContext.Provider
      value={{
        lastDrink,
        dailyCount,
        dailyLimit: settings.dailyLimit,
        dailyCalories,
        todayDrinks,
        recentDrinks,
        settings,
        isLoading,
        waterCount,
        addDrink,
        addWater,
        removeDrink,
        refreshData,
        updateSettings,
        getDrinksForRange,
      }}
    >
      {children}
    </DrinkContext.Provider>
  );
}

export function useDrinks() {
  const context = useContext(DrinkContext);
  if (!context) {
    throw new Error('useDrinks must be used within a DrinkProvider');
  }
  return context;
}
