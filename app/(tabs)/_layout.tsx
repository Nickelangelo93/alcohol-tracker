import { Tabs } from 'expo-router';
import { Text, StyleSheet, View, Platform } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import { spacing, borderRadius } from '../../src/constants/theme';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  const { themeColors } = useTheme();
  return (
    <View style={[
      styles.tabIconContainer,
      focused && { backgroundColor: themeColors.primarySoft },
    ]}>
      <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.5 }]}>{icon}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.tabBar,
          borderTopColor: themeColors.tabBarBorder,
          borderTopWidth: 0,
          height: Platform.OS === 'web' ? 88 : 88,
          paddingBottom: Platform.OS === 'web' ? 24 : 30,
          paddingTop: 10,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: theme === 'dark' ? 0.2 : 0.04,
              shadowRadius: 12,
            },
          }),
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t.tabs.history,
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: t.tabs.statistics,
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 28,
    borderRadius: borderRadius.md,
  },
  tabIcon: {
    fontSize: 20,
  },
});
