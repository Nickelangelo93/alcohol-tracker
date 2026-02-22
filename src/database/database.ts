import * as SQLite from 'expo-sqlite';
import { Drink, DrinkType, AppSettings, DEFAULT_SETTINGS } from '../types';

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

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('alcohol_tracker.db');
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS drinks (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_drinks_timestamp ON drinks(timestamp);
  `);
}

// --- Drinks ---

export async function addDrink(type: DrinkType, timestamp?: number): Promise<Drink> {
  const database = await getDatabase();
  const now = Date.now();
  const drink: Drink = {
    id: generateId(),
    type,
    timestamp: timestamp || now,
    createdAt: now,
  };

  await database.runAsync(
    'INSERT INTO drinks (id, type, timestamp, created_at) VALUES (?, ?, ?, ?)',
    [drink.id, drink.type, drink.timestamp, drink.createdAt]
  );

  return drink;
}

export async function deleteDrink(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM drinks WHERE id = ?', [id]);
}

export async function getDrinks(
  startTimestamp?: number,
  endTimestamp?: number
): Promise<Drink[]> {
  const database = await getDatabase();
  let query = 'SELECT id, type, timestamp, created_at as createdAt FROM drinks';
  const params: (number | string)[] = [];

  if (startTimestamp !== undefined && endTimestamp !== undefined) {
    query += ' WHERE timestamp >= ? AND timestamp < ?';
    params.push(startTimestamp, endTimestamp);
  } else if (startTimestamp !== undefined) {
    query += ' WHERE timestamp >= ?';
    params.push(startTimestamp);
  } else if (endTimestamp !== undefined) {
    query += ' WHERE timestamp < ?';
    params.push(endTimestamp);
  }

  query += ' ORDER BY timestamp DESC';

  const results = await database.getAllAsync<{
    id: string;
    type: string;
    timestamp: number;
    createdAt: number;
  }>(query, params);

  return results.map((row) => ({
    id: row.id,
    type: row.type as DrinkType,
    timestamp: row.timestamp,
    createdAt: row.createdAt,
  }));
}

export async function getLastDrink(): Promise<Drink | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    id: string;
    type: string;
    timestamp: number;
    createdAt: number;
  }>('SELECT id, type, timestamp, created_at as createdAt FROM drinks ORDER BY timestamp DESC LIMIT 1');

  if (!result) return null;

  return {
    id: result.id,
    type: result.type as DrinkType,
    timestamp: result.timestamp,
    createdAt: result.createdAt,
  };
}

export async function getDrinkCountForRange(
  startTimestamp: number,
  endTimestamp: number
): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM drinks WHERE timestamp >= ? AND timestamp < ?',
    [startTimestamp, endTimestamp]
  );
  return result?.count || 0;
}

export async function deleteAllDrinks(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM drinks');
}

export async function getAllDrinksForExport(): Promise<Drink[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{
    id: string;
    type: string;
    timestamp: number;
    createdAt: number;
  }>('SELECT id, type, timestamp, created_at as createdAt FROM drinks ORDER BY timestamp ASC');

  return results.map((row) => ({
    id: row.id,
    type: row.type as DrinkType,
    timestamp: row.timestamp,
    createdAt: row.createdAt,
  }));
}

export async function importDrinks(drinks: Drink[]): Promise<number> {
  const database = await getDatabase();
  let imported = 0;

  for (const drink of drinks) {
    try {
      await database.runAsync(
        'INSERT OR IGNORE INTO drinks (id, type, timestamp, created_at) VALUES (?, ?, ?, ?)',
        [drink.id, drink.type, drink.timestamp, drink.createdAt]
      );
      imported++;
    } catch (e) {
      // Skip duplicates
    }
  }

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
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return result?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
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
