# BAC (Blood Alcohol Content) Estimation - Implementation Plan

## Overview
Add real-time BAC estimation to the alcohol tracker app. Users enter their weight and gender once, then see a live-updating BAC estimate based on their logged drinks.

## BAC Calculation (Widmark Formula)
For each drink, calculate the BAC contribution and subtract continuous metabolism:
- **Alcohol grams per drink**: beer=13g, wine=14.2g, spirits=12.6g, cocktail=18g, other=14g
- **Widmark factor (r)**: male=0.68, female=0.55, other=0.615
- **Elimination rate (β)**: 0.015% per hour (continuous from first drink)
- **Formula**: BAC = (totalAlcoholGrams / (weightKg × r × 10)) − (β × hoursSinceFirstDrink)
- BAC is clamped to minimum 0

## Files to Create
1. **`src/utils/bac.ts`** — Pure calculation functions (alcohol grams per type, BAC from drinks array, time to zero estimate)
2. **`src/hooks/useBAC.ts`** — React hook that updates BAC every 10 seconds (same pattern as useTimer)

## Files to Modify
1. **`src/types/index.ts`** — Add `userWeight`, `userGender` to AppSettings + UserGender type
2. **`src/constants/theme.ts`** — Add `drinkAlcoholGrams` mapping
3. **`src/context/DrinkContext.tsx`** — Add `todayDrinks` to context (full Drink[] for BAC calculation)
4. **`app/(tabs)/index.tsx`** — Add BAC setup prompt card + live BAC display card
5. **`app/(tabs)/settings.tsx`** — Add "Profiel" section with weight input + gender selector
6. **`app/(tabs)/history.tsx`** — Add estimated peak BAC badge per selected day
7. **`app/(tabs)/statistics.tsx`** — Add avg/max BAC metric cards

## Step-by-step

### Step 1: Types & Constants
- Add `UserGender = 'male' | 'female' | 'other'` type
- Add `userWeight: number | null` and `userGender: UserGender | null` to AppSettings
- Add `drinkAlcoholGrams` to theme.ts

### Step 2: BAC utility + hook
- Create `bac.ts` with `calculateBAC(drinks, weight, gender)` and `estimateTimeToZero(bac)`
- Create `useBAC.ts` hook returning `{ bac, timeToZero, trend, isActive, isConfigured }`

### Step 3: DrinkContext update
- Expose `todayDrinks: Drink[]` from context so BAC hook can use them

### Step 4: Home screen
- If weight/gender not set → show setup prompt card with gradient styling
- If configured → show BAC card with color-coded value (green/orange/red), time to sober, status text

### Step 5: Settings screen
- New "Profiel" section with weight stepper and gender toggle buttons (Man/Vrouw/Anders)

### Step 6: History screen
- Show estimated peak BAC for the selected day in the day header

### Step 7: Statistics screen
- Add 2 metric cards: "Hoogste BAC deze maand" and "Gem. BAC per drinkdag"
