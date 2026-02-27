import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize } from '../../constants/theme';
import { SocialSection } from '../../types/social';

interface Props {
  activeSection: SocialSection;
  onChangeSection: (section: SocialSection) => void;
  labels: { friends: string; groups: string; live: string };
}

export function SocialSectionTabs({ activeSection, onChangeSection, labels }: Props) {
  const { themeColors } = useTheme();

  const tabs: { key: SocialSection; label: string }[] = [
    { key: 'friends', label: labels.friends },
    { key: 'groups', label: labels.groups },
    { key: 'live', label: labels.live },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surfaceLight }]}>
      {tabs.map((tab) => {
        const active = activeSection === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              active && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => onChangeSection(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: active ? '#ffffff' : themeColors.textSecondary },
                active && { fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
