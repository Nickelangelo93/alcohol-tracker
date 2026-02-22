import { useState, useCallback, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { LanguageProvider } from '../src/context/LanguageContext';
import { DrinkProvider } from '../src/context/DrinkContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { REVENUECAT_API_KEY } from '../src/constants/purchases';

// Only import native-only modules on native
let SplashScreen: any = null;
let AnimatedSplash: any = null;
if (Platform.OS !== 'web') {
  SplashScreen = require('expo-splash-screen');
  SplashScreen.preventAutoHideAsync();
  AnimatedSplash = require('../src/components/AnimatedSplash').AnimatedSplash;
}

function RootLayoutInner() {
  const { theme, themeColors } = useTheme();
  const [showSplash, setShowSplash] = useState(Platform.OS !== 'web');

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: themeColors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {showSplash && AnimatedSplash && <AnimatedSplash onAnimationFinish={handleSplashFinish} />}
    </>
  );
}

export default function RootLayout() {
  const onLayoutReady = useCallback(async () => {
    if (SplashScreen) {
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    // Skip RevenueCat on web
    if (Platform.OS === 'web') return;
    if (REVENUECAT_API_KEY && !REVENUECAT_API_KEY.includes('YOUR_')) {
      try {
        const Purchases = require('react-native-purchases').default;
        Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      } catch (e) {
        // RevenueCat not configured yet — tip jar will gracefully hide
      }
    }
  }, []);

  // Register service worker for PWA offline support
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <GestureHandlerRootView
      style={[
        styles.container,
        Platform.OS === 'web' && styles.webContainer,
      ]}
      onLayout={onLayoutReady}
    >
      <ThemeProvider>
        <LanguageProvider>
          <DrinkProvider>
            <RootLayoutInner />
          </DrinkProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    maxWidth: 480,
    marginHorizontal: 'auto' as any,
    width: '100%' as any,
    minHeight: '100vh' as any,
  },
});
