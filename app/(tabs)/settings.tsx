import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { UserGender } from '../../src/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import { useDrinks } from '../../src/context/DrinkContext';
import { getAllDrinksForExport, importDrinks, deleteAllDrinks } from '../../src/database/database';
import { spacing, borderRadius, fontSize, shadows } from '../../src/constants/theme';
import { TipJarSection } from '../../src/components/TipJarSection';
import { format } from 'date-fns';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function SettingsScreen() {
  const { theme, themeColors, setTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const { settings, updateSettings, refreshData } = useDrinks();
  const [limitInput, setLimitInput] = useState(String(settings.dailyLimit));
  const [weightInput, setWeightInput] = useState(settings.userWeight ? String(settings.userWeight) : '');

  useEffect(() => {
    setWeightInput(settings.userWeight ? String(settings.userWeight) : '');
  }, [settings.userWeight]);

  const handleLimitChange = (text: string) => {
    setLimitInput(text);
    const num = parseInt(text);
    if (!isNaN(num) && num > 0 && num <= 50) {
      updateSettings({ dailyLimit: num });
    }
  };

  const handleExport = async () => {
    try {
      const drinks = await getAllDrinksForExport();
      if (drinks.length === 0) {
        Alert.alert(t.settings.exportNoData, t.settings.exportNoDataMsg);
        return;
      }
      let csv = 'id,type,timestamp,datetime,created_at\n';
      drinks.forEach((d) => {
        csv += `${d.id},${d.type},${d.timestamp},"${format(new Date(d.timestamp), 'yyyy-MM-dd HH:mm:ss')}",${d.createdAt}\n`;
      });
      const fileName = `alcohol-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;

      if (Platform.OS === 'web') {
        const { exportCsvWeb } = require('../../src/utils/fileUtils');
        exportCsvWeb(csv, fileName);
      } else {
        const FileSystem = require('expo-file-system');
        const Sharing = require('expo-sharing');
        const filePath = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'text/csv',
            dialogTitle: t.settings.exportDialogTitle,
            UTI: 'public.comma-separated-values-text',
          });
        }
      }
    } catch (error) {
      Alert.alert(t.settings.error, t.settings.exportErrorMsg);
    }
  };

  const parseCsvContent = (content: string) => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) { Alert.alert(t.settings.error, t.settings.importErrorNoData); return; }
    const drinks = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 5) {
        drinks.push({
          id: parts[0].trim(), type: parts[1].trim() as any,
          timestamp: parseInt(parts[2].trim()), createdAt: parseInt(parts[4].trim()),
        });
      }
    }
    if (drinks.length === 0) { Alert.alert(t.settings.error, t.settings.importErrorNoValid); return; }
    Alert.alert(t.settings.importTitle, t.settings.importConfirm(drinks.length), [
      { text: t.settings.importCancel, style: 'cancel' },
      {
        text: t.settings.importButton,
        onPress: async () => {
          const imported = await importDrinks(drinks);
          await refreshData();
          Alert.alert(t.settings.importSuccess, t.settings.importSuccessMsg(imported));
        },
      },
    ]);
  };

  const handleImport = async () => {
    try {
      if (Platform.OS === 'web') {
        const { importCsvWeb } = require('../../src/utils/fileUtils');
        const content = await importCsvWeb();
        if (!content) return;
        parseCsvContent(content);
      } else {
        const DocumentPicker = require('expo-document-picker');
        const FileSystem = require('expo-file-system');
        const result = await DocumentPicker.getDocumentAsync({
          type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
          copyToCacheDirectory: true,
        });
        if (result.canceled) return;
        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);
        parseCsvContent(content);
      }
    } catch (error) {
      Alert.alert(t.settings.error, t.settings.importErrorMsg);
    }
  };

  const handleReset = () => {
    Alert.alert(t.settings.resetDataTitle, t.settings.resetDataMessage, [
      { text: t.settings.importCancel, style: 'cancel' },
      {
        text: t.settings.resetDataConfirm,
        style: 'destructive',
        onPress: async () => {
          await deleteAllDrinks();
          await refreshData();
          Alert.alert(t.settings.resetDataSuccess, t.settings.resetDataSuccessMsg);
        },
      },
    ]);
  };

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;
  const cardStyle = [
    { backgroundColor: themeColors.surface },
    cardShadow,
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AnimatedView entering={FadeIn.duration(500)} style={styles.headerContainer}>
            <Text style={[styles.header, { color: themeColors.text }]}>{t.settings.title}</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {t.settings.subtitle}
            </Text>
          </AnimatedView>

          {/* Daily Limit */}
          <AnimatedView
            entering={FadeInDown.delay(100).duration(500).springify().damping(18)}
            style={[styles.section, ...cardStyle]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#F9731618' }]}>
                <Text style={styles.sectionIconText}>🎯</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.settings.dailyLimit}</Text>
            </View>
            <Text style={[styles.settingDesc, { color: themeColors.textSecondary }]}>
              {t.settings.dailyLimitDesc}
            </Text>
            <View style={styles.limitRow}>
              <TouchableOpacity
                style={[styles.limitBtn, { backgroundColor: themeColors.primarySoft }]}
                onPress={() => {
                  const v = Math.max(1, settings.dailyLimit - 1);
                  setLimitInput(String(v));
                  updateSettings({ dailyLimit: v });
                }}
              >
                <Text style={[styles.limitBtnText, { color: themeColors.primary }]}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.limitInput, {
                  color: themeColors.text,
                  backgroundColor: themeColors.surfaceLight,
                }]}
                value={limitInput}
                onChangeText={handleLimitChange}
                keyboardType="number-pad"
                textAlign="center"
                maxLength={2}
              />
              <TouchableOpacity
                style={[styles.limitBtn, { backgroundColor: themeColors.primarySoft }]}
                onPress={() => {
                  const v = Math.min(50, settings.dailyLimit + 1);
                  setLimitInput(String(v));
                  updateSettings({ dailyLimit: v });
                }}
              >
                <Text style={[styles.limitBtnText, { color: themeColors.primary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </AnimatedView>

          {/* Profile (BAC) */}
          <AnimatedView
            entering={FadeInDown.delay(200).duration(500).springify().damping(18)}
            style={[styles.section, ...cardStyle]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#06b6d418' }]}>
                <Text style={styles.sectionIconText}>⚖️</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.settings.profile}</Text>
            </View>
            <Text style={[styles.settingDesc, { color: themeColors.textSecondary }]}>
              {t.settings.profileDesc}
            </Text>

            <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>{t.settings.weightLabel}</Text>
            <View style={styles.limitRow}>
              <TouchableOpacity
                style={[styles.limitBtn, { backgroundColor: themeColors.primarySoft }]}
                onPress={() => {
                  const current = settings.userWeight || 70;
                  const v = Math.max(30, current - 1);
                  setWeightInput(String(v));
                  updateSettings({ userWeight: v });
                }}
              >
                <Text style={[styles.limitBtnText, { color: themeColors.primary }]}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.limitInput, {
                  color: themeColors.text,
                  backgroundColor: themeColors.surfaceLight,
                }]}
                value={weightInput}
                onChangeText={(text) => {
                  setWeightInput(text);
                  const num = parseInt(text);
                  if (!isNaN(num) && num >= 30 && num <= 250) {
                    updateSettings({ userWeight: num });
                  }
                }}
                keyboardType="number-pad"
                textAlign="center"
                maxLength={3}
                placeholder="70"
                placeholderTextColor={themeColors.textMuted}
              />
              <TouchableOpacity
                style={[styles.limitBtn, { backgroundColor: themeColors.primarySoft }]}
                onPress={() => {
                  const current = settings.userWeight || 70;
                  const v = Math.min(250, current + 1);
                  setWeightInput(String(v));
                  updateSettings({ userWeight: v });
                }}
              >
                <Text style={[styles.limitBtnText, { color: themeColors.primary }]}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: themeColors.textSecondary, marginTop: spacing.lg }]}>{t.settings.genderLabel}</Text>
            <View style={styles.genderButtons}>
              {([
                { value: 'male' as UserGender, label: t.settings.genderMale },
                { value: 'female' as UserGender, label: t.settings.genderFemale },
                { value: 'other' as UserGender, label: t.settings.genderOther },
              ]).map((option) => {
                const isActive = settings.userGender === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderButton,
                      {
                        backgroundColor: isActive ? themeColors.primarySoft : themeColors.surfaceLight,
                        borderColor: isActive ? themeColors.primary : 'transparent',
                      },
                    ]}
                    onPress={() => updateSettings({ userGender: option.value })}
                  >
                    <Text style={[
                      styles.genderLabel,
                      { color: isActive ? themeColors.primary : themeColors.text },
                    ]}>
                      {option.label}
                    </Text>
                    {isActive && (
                      <View style={[styles.checkDot, { backgroundColor: themeColors.primary }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </AnimatedView>

          {/* Water Reminder */}
          <AnimatedView
            entering={FadeInDown.delay(300).duration(500).springify().damping(18)}
            style={[styles.section, ...cardStyle]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#06b6d418' }]}>
                <Text style={styles.sectionIconText}>💧</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.settings.waterReminder}</Text>
            </View>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={[styles.switchTitle, { color: themeColors.text }]}>{t.settings.waterReminderToggle}</Text>
                <Text style={[styles.switchDesc, { color: themeColors.textMuted }]}>
                  {t.settings.waterReminderDesc}
                </Text>
              </View>
              <Switch
                value={settings.waterReminderEnabled}
                onValueChange={(v) => updateSettings({ waterReminderEnabled: v })}
                trackColor={{ false: themeColors.border, true: themeColors.primary + '60' }}
                thumbColor={settings.waterReminderEnabled ? themeColors.primary : themeColors.textMuted}
              />
            </View>
            {settings.waterReminderEnabled && (
              <>
                <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                <Text style={[styles.settingDesc, { color: themeColors.textSecondary, marginTop: spacing.sm }]}>
                  {t.settings.waterReminderInterval}
                </Text>
                <View style={styles.limitRow}>
                  <TouchableOpacity
                    style={[styles.limitBtn, { backgroundColor: themeColors.primarySoft }]}
                    onPress={() => {
                      const v = Math.max(1, settings.waterReminderInterval - 1);
                      updateSettings({ waterReminderInterval: v });
                    }}
                  >
                    <Text style={[styles.limitBtnText, { color: themeColors.primary }]}>−</Text>
                  </TouchableOpacity>
                  <View style={[styles.waterIntervalDisplay, {
                    backgroundColor: themeColors.surfaceLight,
                  }]}>
                    <Text style={[styles.waterIntervalText, { color: themeColors.text }]}>
                      {settings.waterReminderInterval}
                    </Text>
                    <Text style={[styles.waterIntervalLabel, { color: themeColors.textMuted }]}>
                      {t.settings.waterReminderDrinks}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.limitBtn, { backgroundColor: themeColors.primarySoft }]}
                    onPress={() => {
                      const v = Math.min(10, settings.waterReminderInterval + 1);
                      updateSettings({ waterReminderInterval: v });
                    }}
                  >
                    <Text style={[styles.limitBtnText, { color: themeColors.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </AnimatedView>

          {/* Theme */}
          <AnimatedView
            entering={FadeInDown.delay(400).duration(500).springify().damping(18)}
            style={[styles.section, ...cardStyle]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#f59e0b18' }]}>
                <Text style={styles.sectionIconText}>🎨</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.settings.theme}</Text>
            </View>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: theme === 'dark' ? themeColors.primarySoft : themeColors.surfaceLight,
                    borderColor: theme === 'dark' ? themeColors.primary : 'transparent',
                  },
                ]}
                onPress={() => setTheme('dark')}
              >
                <Text style={styles.themeEmoji}>🌙</Text>
                <Text style={[styles.themeLabel, { color: themeColors.text }]}>{t.settings.themeDark}</Text>
                {theme === 'dark' && (
                  <View style={[styles.checkDot, { backgroundColor: themeColors.primary }]} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: theme === 'light' ? themeColors.primarySoft : themeColors.surfaceLight,
                    borderColor: theme === 'light' ? themeColors.primary : 'transparent',
                  },
                ]}
                onPress={() => setTheme('light')}
              >
                <Text style={styles.themeEmoji}>☀️</Text>
                <Text style={[styles.themeLabel, { color: themeColors.text }]}>{t.settings.themeLight}</Text>
                {theme === 'light' && (
                  <View style={[styles.checkDot, { backgroundColor: themeColors.primary }]} />
                )}
              </TouchableOpacity>
            </View>
          </AnimatedView>

          {/* Language */}
          <AnimatedView
            entering={FadeInDown.delay(500).duration(500).springify().damping(18)}
            style={[styles.section, ...cardStyle]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#3b82f618' }]}>
                <Text style={styles.sectionIconText}>🌐</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.settings.language}</Text>
            </View>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: language === 'nl' ? themeColors.primarySoft : themeColors.surfaceLight,
                    borderColor: language === 'nl' ? themeColors.primary : 'transparent',
                  },
                ]}
                onPress={() => setLanguage('nl')}
              >
                <Text style={styles.themeEmoji}>🇳🇱</Text>
                <Text style={[styles.themeLabel, { color: themeColors.text }]}>{t.settings.languageNl}</Text>
                {language === 'nl' && (
                  <View style={[styles.checkDot, { backgroundColor: themeColors.primary }]} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: language === 'en' ? themeColors.primarySoft : themeColors.surfaceLight,
                    borderColor: language === 'en' ? themeColors.primary : 'transparent',
                  },
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text style={styles.themeEmoji}>🇬🇧</Text>
                <Text style={[styles.themeLabel, { color: themeColors.text }]}>{t.settings.languageEn}</Text>
                {language === 'en' && (
                  <View style={[styles.checkDot, { backgroundColor: themeColors.primary }]} />
                )}
              </TouchableOpacity>
            </View>
          </AnimatedView>

          {/* Notifications */}
          <AnimatedView
            entering={FadeInDown.delay(600).duration(500).springify().damping(18)}
            style={[styles.section, ...cardStyle]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#ec489918' }]}>
                <Text style={styles.sectionIconText}>🔔</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.settings.notifications}</Text>
            </View>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={[styles.switchTitle, { color: themeColors.text }]}>{t.settings.dailyReminder}</Text>
                <Text style={[styles.switchDesc, { color: themeColors.textMuted }]}>
                  {t.settings.dailyReminderDesc}
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
                trackColor={{ false: themeColors.border, true: themeColors.primary + '60' }}
                thumbColor={settings.notificationsEnabled ? themeColors.primary : themeColors.textMuted}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={[styles.switchTitle, { color: themeColors.text }]}>{t.settings.limitWarning}</Text>
                <Text style={[styles.switchDesc, { color: themeColors.textMuted }]}>
                  {t.settings.limitWarningDesc}
                </Text>
              </View>
              <Switch
                value={settings.limitWarningEnabled}
                onValueChange={(v) => updateSettings({ limitWarningEnabled: v })}
                trackColor={{ false: themeColors.border, true: themeColors.primary + '60' }}
                thumbColor={settings.limitWarningEnabled ? themeColors.primary : themeColors.textMuted}
              />
            </View>
          </AnimatedView>

          {/* Data */}
          <AnimatedView
            entering={FadeInDown.delay(700).duration(500).springify().damping(18)}
            style={[styles.section, ...cardStyle]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#10b98118' }]}>
                <Text style={styles.sectionIconText}>💾</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t.settings.data}</Text>
            </View>
            <TouchableOpacity
              style={[styles.dataButton, { backgroundColor: themeColors.surfaceLight }]}
              onPress={handleExport}
              activeOpacity={0.7}
            >
              <Text style={styles.dataEmoji}>📤</Text>
              <View style={styles.dataTextContainer}>
                <Text style={[styles.dataTitle, { color: themeColors.text }]}>{t.settings.exportCsv}</Text>
                <Text style={[styles.dataSub, { color: themeColors.textMuted }]}>
                  {t.settings.exportCsvDesc}
                </Text>
              </View>
              <Text style={[styles.dataArrow, { color: themeColors.textMuted }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dataButton, { backgroundColor: themeColors.surfaceLight }]}
              onPress={handleImport}
              activeOpacity={0.7}
            >
              <Text style={styles.dataEmoji}>📥</Text>
              <View style={styles.dataTextContainer}>
                <Text style={[styles.dataTitle, { color: themeColors.text }]}>{t.settings.importCsv}</Text>
                <Text style={[styles.dataSub, { color: themeColors.textMuted }]}>
                  {t.settings.importCsvDesc}
                </Text>
              </View>
              <Text style={[styles.dataArrow, { color: themeColors.textMuted }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dataButton, { backgroundColor: themeColors.dangerSoft }]}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.dataEmoji}>🗑️</Text>
              <View style={styles.dataTextContainer}>
                <Text style={[styles.dataTitle, { color: themeColors.danger }]}>{t.settings.resetData}</Text>
                <Text style={[styles.dataSub, { color: themeColors.textMuted }]}>
                  {t.settings.resetDataDesc}
                </Text>
              </View>
              <Text style={[styles.dataArrow, { color: themeColors.textMuted }]}>›</Text>
            </TouchableOpacity>
          </AnimatedView>

          {/* Tip Jar */}
          <TipJarSection />

          {/* About */}
          <AnimatedView
            entering={FadeInDown.delay(900).duration(500).springify().damping(18)}
            style={[styles.section, ...cardStyle]}
          >
            <Text style={[styles.aboutTitle, { color: themeColors.text }]}>
              {t.settings.aboutTitle}
            </Text>
            <Text style={[styles.aboutText, { color: themeColors.textMuted }]}>
              {t.settings.aboutText}
            </Text>
          </AnimatedView>

          <View style={{ height: spacing.xxl * 2 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  section: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  limitBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitBtnText: {
    fontSize: fontSize.xxl,
    fontWeight: '500',
    lineHeight: 34,
  },
  limitInput: {
    width: 64,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.xl,
    fontWeight: '800',
    paddingVertical: 8,
    textAlign: 'center',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
  },
  themeEmoji: { fontSize: 20 },
  themeLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  switchDesc: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
  },
  dataEmoji: { fontSize: 22 },
  dataTextContainer: { flex: 1 },
  dataTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  dataSub: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  dataArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  waterIntervalDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    minWidth: 80,
  },
  waterIntervalText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  waterIntervalLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
  },
  genderLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  aboutTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
});
