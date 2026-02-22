import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import { useDrinks } from '../context/DrinkContext';
import { DrinkType } from '../types';
import { drinkEmojis, drinkCalories, beerVariants, spacing, borderRadius, fontSize, shadows } from '../constants/theme';
import { format } from 'date-fns';

interface DrinkLogModalProps {
  visible: boolean;
  onClose: () => void;
}

const drinkTypes: DrinkType[] = ['beer', 'wine', 'spirits', 'cocktail', 'other'];

const drinkTypeColors: Record<string, string> = {
  beer: '#f59e0b',
  beer_fluitje: '#f59e0b',
  beer_vaasje: '#f59e0b',
  beer_pint: '#f59e0b',
  beer_blikje: '#f59e0b',
  wine: '#e11d48',
  spirits: '#F97316',
  cocktail: '#ec4899',
  other: '#6b7280',
};

export function DrinkLogModal({ visible, onClose }: DrinkLogModalProps) {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { addDrink } = useDrinks();
  const [selectedType, setSelectedType] = useState<DrinkType | null>(null);
  const [beerSubmenuOpen, setBeerSubmenuOpen] = useState(false);
  const [useManualTime, setUseManualTime] = useState(false);
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [manualTime, setManualTime] = useState(format(new Date(), 'HH:mm'));
  const [isLogging, setIsLogging] = useState(false);

  const resetState = () => {
    setSelectedType(null);
    setBeerSubmenuOpen(false);
    setUseManualTime(false);
    setManualDate(format(new Date(), 'yyyy-MM-dd'));
    setManualTime(format(new Date(), 'HH:mm'));
    setIsLogging(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleLog = async (type: DrinkType) => {
    if (isLogging) return;
    setIsLogging(true);
    try {
      let timestamp: number | undefined;
      if (useManualTime) {
        const dateTime = new Date(`${manualDate}T${manualTime}:00`);
        timestamp = dateTime.getTime();
      }
      await addDrink(type, timestamp);
      notificationAsync(NotificationFeedbackType.Success);
      handleClose();
    } catch (error) {
      console.error('Error logging drink:', error);
      setIsLogging(false);
    }
  };

  const handleQuickLog = async (type: DrinkType) => {
    if (type === 'beer') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setBeerSubmenuOpen(!beerSubmenuOpen);
      impactAsync(ImpactFeedbackStyle.Light);
      return;
    }
    if (!useManualTime) {
      await handleLog(type);
    } else {
      setSelectedType(type);
    }
  };

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[
          styles.container,
          {
            backgroundColor: themeColors.surface,
          },
          cardShadow,
        ]}>
          <View style={[styles.handle, { backgroundColor: themeColors.textMuted + '40' }]} />

          <Text style={[styles.title, { color: themeColors.text }]}>
            {t.modal.title}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {t.modal.subtitle}
          </Text>

          {/* Drink type selection */}
          <View style={styles.typeGrid}>
            {drinkTypes.map((type) => {
              const isSelected = selectedType === type;
              const isBeerExpanded = type === 'beer' && beerSubmenuOpen;
              return (
                <React.Fragment key={type}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: isBeerExpanded
                          ? themeColors.primarySoft
                          : isSelected
                          ? themeColors.primarySoft
                          : themeColors.surfaceLight,
                        borderColor: isBeerExpanded
                          ? themeColors.primary
                          : isSelected
                          ? themeColors.primary
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleQuickLog(type)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.typeEmojiContainer,
                        { backgroundColor: (drinkTypeColors[type] || '#6b7280') + '18' },
                      ]}
                    >
                      <Text style={styles.typeEmoji}>{drinkEmojis[type]}</Text>
                    </View>
                    <Text style={[styles.typeLabel, { color: themeColors.text }]}>
                      {t.drinks.labels[type] || type}
                    </Text>
                    {type === 'beer' ? (
                      <Text style={[styles.typeCalories, { color: themeColors.textMuted }]}>
                        {beerSubmenuOpen ? t.modal.chooseSizeOpen : t.modal.chooseSizeClosed}
                      </Text>
                    ) : (
                      <Text style={[styles.typeCalories, { color: themeColors.textMuted }]}>
                        {drinkCalories[type]} kcal
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Beer size submenu */}
                  {type === 'beer' && beerSubmenuOpen && (
                    <View style={styles.beerSubmenu}>
                      {beerVariants.map((variant) => {
                        const variantSelected = selectedType === variant;
                        return (
                          <TouchableOpacity
                            key={variant}
                            style={[
                              styles.beerVariantButton,
                              {
                                backgroundColor: variantSelected
                                  ? themeColors.primarySoft
                                  : themeColors.surfaceLight,
                                borderColor: variantSelected
                                  ? themeColors.primary
                                  : 'transparent',
                              },
                            ]}
                            onPress={() => handleQuickLog(variant as DrinkType)}
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.variantEmojiContainer,
                                { backgroundColor: '#f59e0b18' },
                              ]}
                            >
                              <Text style={styles.variantEmoji}>🍺</Text>
                            </View>
                            <View style={styles.variantInfo}>
                              <Text style={[styles.variantLabel, { color: themeColors.text }]}>
                                {t.drinks.labels[variant] || variant}
                              </Text>
                              <Text style={[styles.variantDetail, { color: themeColors.textMuted }]}>
                                {t.drinks.beerDescriptions[variant] || ''} · {drinkCalories[variant]} kcal
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Manual time toggle */}
          <TouchableOpacity
            style={[styles.manualToggle, { backgroundColor: themeColors.surfaceLight }]}
            onPress={() => setUseManualTime(!useManualTime)}
          >
            <Text style={[styles.manualToggleText, { color: themeColors.textSecondary }]}>
              {useManualTime ? t.modal.manualTimeOn : t.modal.manualTimeQuestion}
            </Text>
            <View style={[
              styles.toggleDot,
              {
                backgroundColor: useManualTime ? themeColors.primary : themeColors.textMuted,
              },
            ]} />
          </TouchableOpacity>

          {/* Manual time inputs */}
          {useManualTime && (
            <View style={styles.manualInputs}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>
                    {t.modal.dateLabel}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: themeColors.surfaceLight,
                        color: themeColors.text,
                      },
                    ]}
                    value={manualDate}
                    onChangeText={setManualDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={themeColors.textMuted}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 0.6 }]}>
                  <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>
                    {t.modal.timeLabel}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: themeColors.surfaceLight,
                        color: themeColors.text,
                      },
                    ]}
                    value={manualTime}
                    onChangeText={setManualTime}
                    placeholder="HH:mm"
                    placeholderTextColor={themeColors.textMuted}
                  />
                </View>
              </View>
              {selectedType && (
                <TouchableOpacity
                  onPress={() => handleLog(selectedType)}
                  disabled={isLogging}
                  activeOpacity={0.85}
                >
                  <View style={[styles.confirmButton, { backgroundColor: themeColors.primary }, shadows.button]}>
                    <Text style={styles.confirmButtonText}>
                      {isLogging ? t.modal.adding : t.modal.addButton(drinkEmojis[selectedType])}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Cancel button */}
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: themeColors.surfaceLight }]}
            onPress={handleClose}
          >
            <Text style={[styles.cancelText, { color: themeColors.textSecondary }]}>
              {t.modal.cancel}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  typeButton: {
    width: '30%',
    aspectRatio: 0.9,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  typeEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeEmoji: {
    fontSize: 26,
  },
  typeLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  typeCalories: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  beerSubmenu: {
    width: '100%',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  beerVariantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  variantEmojiContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantEmoji: {
    fontSize: 18,
  },
  variantInfo: {
    flex: 1,
  },
  variantLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  variantDetail: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  manualToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  manualToggleText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  toggleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  manualInputs: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  confirmButton: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  cancelButton: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
