import { Platform } from 'react-native';

// RevenueCat API keys — replace with your actual keys from the RevenueCat dashboard
const API_KEYS = {
  apple: 'appl_YOUR_REVENUECAT_API_KEY',
  google: 'goog_YOUR_REVENUECAT_API_KEY',
};

export const REVENUECAT_API_KEY = Platform.OS === 'web'
  ? ''
  : Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;

// Product IDs — must match what you create in App Store Connect / Google Play Console
export const PRODUCT_IDS = {
  tipSmall: 'com.alcoholtracker.app.tip.small',
  tipMedium: 'com.alcoholtracker.app.tip.medium',
  tipLarge: 'com.alcoholtracker.app.tip.large',
} as const;

// RevenueCat offering identifier
export const TIPS_OFFERING_ID = 'tips';
