export const gradients = {
  dark: {
    background: ['#1C1C1E', '#1C1C1E', '#1C1C1E'] as const,
    header: ['#2C2C2E', '#3A3A3C'] as const,
    card: ['#2C2C2E', '#2C2C2E'] as const,
    accent: ['#F97316', '#FB923C'] as const,
    button: ['#F97316', '#FB923C'] as const,
    buttonWarm: ['#F97316', '#FB923C'] as const,
    success: ['#10b981', '#34d399'] as const,
    timer: ['#2C2C2E', '#2C2C2E', '#2C2C2E'] as const,
  },
  light: {
    background: ['#FBF6F0', '#FBF6F0', '#FBF6F0'] as const,
    header: ['#FBF6F0', '#FBF6F0'] as const,
    card: ['#FFFFFF', '#FFFFFF'] as const,
    accent: ['#F97316', '#FB923C'] as const,
    button: ['#F97316', '#FB923C'] as const,
    buttonWarm: ['#F97316', '#FB923C'] as const,
    success: ['#10b981', '#34d399'] as const,
    timer: ['#FFFFFF', '#FFFFFF', '#FFFFFF'] as const,
  },
};

export const colors = {
  dark: {
    background: '#1C1C1E',
    surface: '#2C2C2E',
    surfaceLight: '#3A3A3C',
    surfaceSolid: '#2C2C2E',
    card: '#2C2C2E',
    cardBorder: 'transparent',
    primary: '#F97316',
    primaryLight: '#FB923C',
    primarySoft: 'rgba(249, 115, 22, 0.15)',
    accent: '#F97316',
    accentSoft: 'rgba(249, 115, 22, 0.15)',
    success: '#10b981',
    successSoft: 'rgba(16, 185, 129, 0.15)',
    warning: '#f59e0b',
    warningSoft: 'rgba(245, 158, 11, 0.15)',
    danger: '#ef4444',
    dangerSoft: 'rgba(239, 68, 68, 0.15)',
    text: '#F5F5F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    border: 'rgba(255,255,255,0.06)',
    tabBar: '#1C1C1E',
    tabBarBorder: 'rgba(255,255,255,0.06)',
    progressBackground: 'rgba(255,255,255,0.08)',
    // Drink type colors
    beer: '#f59e0b',
    wine: '#e11d48',
    spirits: '#F97316',
    cocktail: '#ec4899',
    other: '#6b7280',
  },
  light: {
    background: '#FBF6F0',
    surface: '#FFFFFF',
    surfaceLight: '#F5F0EA',
    surfaceSolid: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: 'transparent',
    primary: '#F97316',
    primaryLight: '#FB923C',
    primarySoft: 'rgba(249, 115, 22, 0.10)',
    accent: '#F97316',
    accentSoft: 'rgba(249, 115, 22, 0.10)',
    success: '#059669',
    successSoft: 'rgba(5, 150, 105, 0.10)',
    warning: '#d97706',
    warningSoft: 'rgba(217, 119, 6, 0.10)',
    danger: '#dc2626',
    dangerSoft: 'rgba(220, 38, 38, 0.10)',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: 'rgba(0,0,0,0.04)',
    tabBar: '#FFFFFF',
    tabBarBorder: 'rgba(0,0,0,0.04)',
    progressBackground: 'rgba(249, 115, 22, 0.08)',
    // Drink type colors
    beer: '#f59e0b',
    wine: '#e11d48',
    spirits: '#F97316',
    cocktail: '#ec4899',
    other: '#6b7280',
  },
};

export type ThemeColors = typeof colors.dark;
export type ThemeGradients = typeof gradients.dark;

export const drinkEmojis: Record<string, string> = {
  beer: '🍺',
  beer_fluitje: '🍺',
  beer_vaasje: '🍺',
  beer_pint: '🍺',
  beer_blikje: '🍺',
  wine: '🍷',
  spirits: '🥃',
  cocktail: '🍸',
  other: '🥂',
};

export const drinkLabels: Record<string, string> = {
  beer: 'Bier',
  beer_fluitje: 'Fluitje',
  beer_vaasje: 'Vaasje',
  beer_pint: 'Pint',
  beer_blikje: 'Blikje',
  wine: 'Wijn',
  spirits: 'Sterke drank',
  cocktail: 'Cocktail',
  other: 'Overig',
};

// Approximate alcohol grams per standard drink (for BAC calculation)
export const drinkAlcoholGrams: Record<string, number> = {
  beer: 13,              // legacy ~330ml, 5% ABV
  beer_fluitje: 7.1,     // ~180ml, 5% ABV
  beer_vaasje: 9.9,      // ~250ml, 5% ABV
  beer_pint: 19.7,       // ~500ml, 5% ABV
  beer_blikje: 13,        // ~330ml, 5% ABV
  wine: 14.2,     // ~150ml, 12% ABV
  spirits: 12.6,  // ~40ml, 40% ABV
  cocktail: 18,   // gemiddelde cocktail
  other: 14,      // overig/gemiddeld
};

// Approximate calories per standard drink
export const drinkCalories: Record<string, number> = {
  beer: 150,           // legacy ~330ml pils
  beer_fluitje: 77,    // ~180ml
  beer_vaasje: 107,    // ~250ml
  beer_pint: 214,      // ~500ml
  beer_blikje: 141,    // ~330ml
  wine: 125,      // ~150ml wijn
  spirits: 100,   // ~40ml shot
  cocktail: 220,  // gemiddelde cocktail
  other: 150,     // overig/gemiddeld
};

// Beer variant types for submenu
export const beerVariants: string[] = [
  'beer_fluitje', 'beer_vaasje', 'beer_pint', 'beer_blikje',
];

export const beerVariantDescriptions: Record<string, string> = {
  beer_fluitje: '~180ml',
  beer_vaasje: '~250ml',
  beer_pint: '~500ml',
  beer_blikje: '~330ml',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 48,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  cardDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};
