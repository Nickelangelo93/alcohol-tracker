import { useState, useEffect, useRef } from 'react';
import { Drink, AppSettings } from '../types';
import { calculateBAC, BacResult } from '../utils/bac';

const DEFAULT_RESULT: BacResult = {
  bac: 0,
  peakBac: 0,
  timeToZeroMinutes: 0,
  trend: 'zero',
  isConfigured: false,
};

export function useBAC(todayDrinks: Drink[], settings: AppSettings): BacResult {
  const [result, setResult] = useState<BacResult>(DEFAULT_RESULT);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drinksRef = useRef(todayDrinks);
  const settingsRef = useRef(settings);

  // Keep refs in sync
  drinksRef.current = todayDrinks;
  settingsRef.current = settings;

  // Recalculate whenever drinks or settings change
  useEffect(() => {
    const compute = () => {
      const { userWeight, userGender } = settingsRef.current;
      if (!userWeight || !userGender) {
        setResult({ ...DEFAULT_RESULT, isConfigured: false });
        return;
      }

      // Get drinks from past 24h (BAC can't last longer than that)
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      const relevantDrinks = drinksRef.current.filter((d) => d.timestamp > cutoff);

      const bacResult = calculateBAC(relevantDrinks, userWeight, userGender);
      setResult(bacResult);
    };

    compute();

    // Update every 10 seconds for live feel
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(compute, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [todayDrinks, settings.userWeight, settings.userGender]);

  return result;
}
