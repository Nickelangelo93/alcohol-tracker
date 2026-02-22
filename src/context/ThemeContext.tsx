import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '../types';
import { colors, gradients, ThemeColors, ThemeGradients } from '../constants/theme';
import { getAppSettings, saveAppSettings } from '../database/database';

interface ThemeContextType {
  theme: ThemeMode;
  themeColors: ThemeColors;
  themeGradients: ThemeGradients;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themeColors: colors.light,
  themeGradients: gradients.light,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode | null>(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const settings = await getAppSettings();
      setThemeState(settings.themeMode);
    } catch {
      // Default to light theme
      setThemeState('light');
    }
  };

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      const settings = await getAppSettings();
      await saveAppSettings({ ...settings, themeMode: mode });
    } catch {
      // Silently fail
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const current = theme || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Don't render children until theme is loaded from database
  if (theme === null) {
    return null;
  }

  const themeColors = colors[theme];
  const themeGradients = gradients[theme];

  return (
    <ThemeContext.Provider value={{ theme, themeColors, themeGradients, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
