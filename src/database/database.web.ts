import { Drink, DrinkType, AppSettings, DEFAULT_SETTINGS } from '../types';

const DRINKS_KEY = 'alcohol_tracker_drinks';
const SETTINGS_KEY = 'alcohol_tracker_settings';

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map((len) =>
      Array.from({ length: len }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('')
    )
    .join('-');
}

function getDrinksFromStorage(): Drink[] {
  try {
    const raw = localStorage.getItem(DRINKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDrinksToStorage(drinks: Drink[]): void {
  localStorage.setItem(DRINKS_KEY, JSON.stringify(drinks));
}

function getSettingsMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSettingsMap(settings: Record<string, string>): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// --- Database (no-op on web, just for compatibility) ---

export async function getDatabase(): Promise<any> {
  return null;
}

// --- Drinks ---

export async function addDrink(type: DrinkType, timestamp?: number): Promise<Drink> {
  const now = Date.now();
  const drink: Drink = {
    id: generateId(),
    type,
    timestamp: timestamp || now,
    createdAt: now,
  };

  const drinks = getDrinksFromStorage();
  drinks.push(drink);
  saveDrinksToStorage(drinks);

  return drink;
}

export async function deleteDrink(id: string): Promise<void> {
  const drinks = getDrinksFromStorage();
  const filtered = drinks.filter((d) => d.id !== id);
  saveDrinksToStorage(filtered);
}

export async function getDrinks(
  startTimestamp?: number,
  endTimestamp?: number
): Promise<Drink[]> {
  let drinks = getDrinksFromStorage();

  if (startTimestamp !== undefined && endTimestamp !== undefined) {
    drinks = drinks.filter((d) => d.timestamp >= startTimestamp && d.timestamp < endTimestamp);
  } else if (startTimestamp !== undefined) {
    drinks = drinks.filter((d) => d.timestamp >= startTimestamp);
  } else if (endTimestamp !== undefined) {
    drinks = drinks.filter((d) => d.timestamp < endTimestamp);
  }

  return drinks.sort((a, b) => b.timestamp - a.timestamp);
}

export async function getLastDrink(): Promise<Drink | null> {
  const drinks = getDrinksFromStorage();
  if (drinks.length === 0) return null;
  return drinks.sort((a, b) => b.timestamp - a.timestamp)[0];
}

export async function getDrinkCountForRange(
  startTimestamp: number,
  endTimestamp: number
): Promise<number> {
  const drinks = getDrinksFromStorage();
  return drinks.filter((d) => d.timestamp >= startTimestamp && d.timestamp < endTimestamp).length;
}

export async function deleteAllDrinks(): Promise<void> {
  saveDrinksToStorage([]);
}

export async function getAllDrinksForExport(): Promise<Drink[]> {
  const drinks = getDrinksFromStorage();
  return drinks.sort((a, b) => a.timestamp - b.timestamp);
}

export async function importDrinks(drinks: Drink[]): Promise<number> {
  const existing = getDrinksFromStorage();
  const existingIds = new Set(existing.map((d) => d.id));
  let imported = 0;

  for (const drink of drinks) {
    if (!existingIds.has(drink.id)) {
      existing.push(drink);
      existingIds.add(drink.id);
      imported++;
    }
  }

  saveDrinksToStorage(existing);
  return imported;
}

// --- Water ---

export async function getTodayWaterCount(): Promise<number> {
  const todayKey = `water_${new Date().toISOString().slice(0, 10)}`;
  const val = await getSetting(todayKey);
  return val ? parseInt(val, 10) : 0;
}

export async function addWater(): Promise<number> {
  const todayKey = `water_${new Date().toISOString().slice(0, 10)}`;
  const current = await getTodayWaterCount();
  const newCount = current + 1;
  await setSetting(todayKey, String(newCount));
  return newCount;
}

// --- Settings ---

export async function getSetting(key: string): Promise<string | null> {
  const settings = getSettingsMap();
  return settings[key] || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const settings = getSettingsMap();
  settings[key] = value;
  saveSettingsMap(settings);
}

export async function getAppSettings(): Promise<AppSettings> {
  const settingsJson = await getSetting('app_settings');
  if (settingsJson) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await setSetting('app_settings', JSON.stringify(settings));
}
