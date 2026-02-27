import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, borderRadius, fontSize, shadows } from '../../constants/theme';

export function AuthPrompt() {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { signInGoogle, signInApple, signInAsGuest } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (method: 'google' | 'apple' | 'guest') => {
    setLoading(method);
    setError(null);
    try {
      if (method === 'google') await signInGoogle();
      else if (method === 'apple') await signInApple();
      else await signInAsGuest();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err?.message || 'Sign in failed');
    } finally {
      setLoading(null);
    }
  };

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }, cardShadow]}>
      <Text style={styles.emoji}>🍻</Text>
      <Text style={[styles.title, { color: themeColors.text }]}>
        {t.social.auth.title}
      </Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
        {t.social.auth.subtitle}
      </Text>

      {error && (
        <Text style={{ color: '#EF4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => handleSignIn('google')}
        disabled={loading !== null}
      >
        {loading === 'google' ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.buttonText}>{t.social.auth.signInGoogle}</Text>
        )}
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={() => handleSignIn('apple')}
          disabled={loading !== null}
        >
          {loading === 'apple' ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.buttonText}>{t.social.auth.signInApple}</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
        <Text style={[styles.dividerText, { color: themeColors.textMuted }]}>
          {t.social.auth.or}
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeColors.surfaceLight }]}
        onPress={() => handleSignIn('guest')}
        disabled={loading !== null}
      >
        {loading === 'guest' ? (
          <ActivityIndicator color={themeColors.text} size="small" />
        ) : (
          <Text style={[styles.guestText, { color: themeColors.text }]}>
            {t.social.auth.continueGuest}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
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
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  guestText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
});
