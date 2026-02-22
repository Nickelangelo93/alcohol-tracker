import { Platform } from 'react-native';

export const ImpactFeedbackStyle = {
  Light: 'Light' as const,
  Medium: 'Medium' as const,
  Heavy: 'Heavy' as const,
};

export const NotificationFeedbackType = {
  Success: 'Success' as const,
  Warning: 'Warning' as const,
  Error: 'Error' as const,
};

export async function impactAsync(style?: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const Haptics = require('expo-haptics');
  return Haptics.impactAsync(style || Haptics.ImpactFeedbackStyle.Medium);
}

export async function notificationAsync(type?: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const Haptics = require('expo-haptics');
  return Haptics.notificationAsync(type || Haptics.NotificationFeedbackType.Success);
}
