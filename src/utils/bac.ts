import { Drink, UserGender } from '../types';
import { drinkAlcoholGrams } from '../constants/theme';

// Widmark factors by gender
const WIDMARK_FACTORS: Record<UserGender, number> = {
  male: 0.68,
  female: 0.55,
  other: 0.615,
};

// Average BAC elimination rate per hour
const ELIMINATION_RATE = 0.015;

// Absorption time: most alcohol is absorbed within ~30 min
const ABSORPTION_MINUTES = 30;

export interface BacResult {
  bac: number; // current BAC as percentage (e.g. 0.05 = 0.05%)
  peakBac: number; // highest BAC reached in current session
  timeToZeroMinutes: number; // minutes until BAC reaches 0
  trend: 'rising' | 'declining' | 'zero';
  isConfigured: boolean;
}

/**
 * Calculate current BAC using Widmark formula.
 *
 * For each drink, we model:
 * - Instant absorption (simplified: full alcohol hits at drink time + absorption delay)
 * - Continuous elimination from first drink onwards
 *
 * BAC at time T = sum of each drink's contribution - total elimination
 * Per drink contribution = alcoholGrams / (bodyWeight * widmarkFactor * 10)
 * Elimination = eliminationRate * hoursSinceFirstDrink
 */
export function calculateBAC(
  drinks: Drink[],
  weightKg: number,
  gender: UserGender,
  atTime?: number,
): BacResult {
  if (drinks.length === 0 || !weightKg || !gender) {
    return { bac: 0, peakBac: 0, timeToZeroMinutes: 0, trend: 'zero', isConfigured: !!weightKg && !!gender };
  }

  const now = atTime || Date.now();
  const r = WIDMARK_FACTORS[gender];

  // Sort drinks by timestamp ascending (oldest first)
  const sorted = [...drinks].sort((a, b) => a.timestamp - b.timestamp);
  const firstDrinkTime = sorted[0].timestamp;

  // Calculate total BAC contribution from all absorbed drinks
  let totalAlcoholContribution = 0;
  let lastDrinkAbsorptionTime = 0;

  for (const drink of sorted) {
    const alcoholGrams = drinkAlcoholGrams[drink.type] || 14;
    const absorptionTime = drink.timestamp + ABSORPTION_MINUTES * 60 * 1000;

    // Absorption model: rapid initial absorption (~50% immediate), rest over 30 min
    // This gives a more realistic rise curve instead of showing 0 right after drinking
    const fullContribution = alcoholGrams / (weightKg * r * 10);
    if (now >= absorptionTime) {
      totalAlcoholContribution += fullContribution;
    } else if (now >= drink.timestamp) {
      const elapsed = now - drink.timestamp;
      const linearRatio = elapsed / (ABSORPTION_MINUTES * 60 * 1000);
      // Fast start: 50% absorbed immediately, remaining 50% linearly over absorption period
      const absorptionRatio = 0.5 + 0.5 * linearRatio;
      totalAlcoholContribution += fullContribution * absorptionRatio;
    }

    if (now >= drink.timestamp) {
      lastDrinkAbsorptionTime = Math.max(lastDrinkAbsorptionTime, absorptionTime);
    }
  }

  // Calculate elimination since first drink
  const hoursSinceFirstDrink = (now - firstDrinkTime) / (1000 * 60 * 60);
  const elimination = ELIMINATION_RATE * hoursSinceFirstDrink;

  // Current BAC = alcohol contribution - elimination (minimum 0)
  const bac = Math.max(0, totalAlcoholContribution - elimination);

  // Determine trend: rising if last drink still absorbing, otherwise declining
  const trend: BacResult['trend'] = bac === 0
    ? 'zero'
    : now < lastDrinkAbsorptionTime
    ? 'rising'
    : 'declining';

  // Time to zero: BAC / elimination rate, converted to minutes
  const timeToZeroMinutes = bac > 0
    ? Math.ceil((bac / ELIMINATION_RATE) * 60)
    : 0;

  // Calculate peak BAC (at the point where last drink is fully absorbed)
  const peakTime = lastDrinkAbsorptionTime;
  let peakContribution = 0;
  for (const drink of sorted) {
    if (drink.timestamp <= peakTime) {
      const alcoholGrams = drinkAlcoholGrams[drink.type] || 14;
      peakContribution += alcoholGrams / (weightKg * r * 10);
    }
  }
  const peakElimination = ELIMINATION_RATE * ((peakTime - firstDrinkTime) / (1000 * 60 * 60));
  const peakBac = Math.max(0, peakContribution - peakElimination);

  return {
    bac: Math.round(bac * 1000) / 1000, // Round to 3 decimal places
    peakBac: Math.round(peakBac * 1000) / 1000,
    timeToZeroMinutes,
    trend,
    isConfigured: true,
  };
}

/**
 * Calculate peak BAC for a set of drinks on a given day (for history/stats).
 */
export function calculatePeakBAC(
  drinks: Drink[],
  weightKg: number,
  gender: UserGender,
): number {
  if (drinks.length === 0 || !weightKg || !gender) return 0;

  const sorted = [...drinks].sort((a, b) => a.timestamp - b.timestamp);

  // Simulate BAC over time, checking after each drink is absorbed
  let maxBac = 0;
  for (const drink of sorted) {
    const checkTime = drink.timestamp + ABSORPTION_MINUTES * 60 * 1000;
    const result = calculateBAC(sorted.filter(d => d.timestamp <= checkTime), weightKg, gender, checkTime);
    maxBac = Math.max(maxBac, result.bac);
  }

  return Math.round(maxBac * 1000) / 1000;
}

/**
 * Format BAC as a readable string.
 */
export function formatBAC(bac: number): string {
  return bac.toFixed(2);
}

/**
 * Format time to zero as readable text.
 */
export function formatTimeToZero(
  minutes: number,
  labels?: { sober: string; hourAbbrev: string; hourWord: string },
): string {
  const l = labels || { sober: 'Nuchter', hourAbbrev: 'u', hourWord: 'uur' };
  if (minutes <= 0) return l.sober;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `~${h}${l.hourAbbrev} ${m}min`;
  if (h > 0) return `~${h} ${l.hourWord}`;
  return `~${m} min`;
}

/**
 * Get a BAC status level for color coding.
 */
export function getBacLevel(bac: number): 'zero' | 'low' | 'moderate' | 'high' {
  if (bac <= 0) return 'zero';
  if (bac < 0.03) return 'low';
  if (bac < 0.05) return 'moderate';
  return 'high';
}
