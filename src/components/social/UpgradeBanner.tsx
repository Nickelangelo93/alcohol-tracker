import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, borderRadius, fontSize, shadows } from '../../constants/theme';

export function UpgradeBanner() {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { upgradeToGoogle, upgradeToApple } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (method: 'google' | 'apple') => {
    setLoading(true);
    try {
      if (method === 'google') await upgradeToGoogle();
      else await upgradeToApple();
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.primarySoft }, cardShadow]}>
      <Text style={styles.emoji}>🔗</Text>
      <Text style={[styles.title, { color: themeColors.text }]}>
        {t.social.auth.upgradeTitle}
      </Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
        {t.social.auth.upgradeSubtitle}
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => handleUpgrade('google')}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>{t.social.auth.signInGoogle}</Text>
        )}
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={() => handleUpgrade('apple')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{t.social.auth.signInApple}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
