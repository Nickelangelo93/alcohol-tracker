import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTimeSince } from '../utils/date';

interface TimerResult {
  text: string;
  subText: string;
  days: number;
  hours: number;
  minutes: number;
  isActive: boolean;
}

interface TimerLabels {
  noDrinksLogged: string;
  hourWord: string;
  dayWord: string;
  daysWord: string;
}

export function useTimer(lastDrinkTimestamp: number | null, labels?: TimerLabels): TimerResult {
  const [timerResult, setTimerResult] = useState<TimerResult>({
    text: '--:--',
    subText: '',
    days: 0,
    hours: 0,
    minutes: 0,
    isActive: false,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateTimer = useCallback(() => {
    const l = labels || {
      noDrinksLogged: 'Nog geen drankjes gelogd',
      hourWord: 'uur',
      dayWord: 'dag',
      daysWord: 'dagen',
    };

    if (lastDrinkTimestamp === null) {
      setTimerResult({
        text: '--:--',
        subText: l.noDrinksLogged,
        days: 0,
        hours: 0,
        minutes: 0,
        isActive: false,
      });
      return;
    }

    const result = formatTimeSince(lastDrinkTimestamp, {
      hourWord: l.hourWord,
      dayWord: l.dayWord,
      daysWord: l.daysWord,
    });
    setTimerResult({
      ...result,
      isActive: true,
    });
  }, [lastDrinkTimestamp, labels]);

  useEffect(() => {
    updateTimer();

    // Update every 10 seconds for a live feel without too much CPU
    intervalRef.current = setInterval(updateTimer, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateTimer]);

  return timerResult;
}
