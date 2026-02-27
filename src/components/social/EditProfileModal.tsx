import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, borderRadius, fontSize, shadows } from '../../constants/theme';

const AVATAR_OPTIONS = [
  '🍻', '🍺', '🍷', '🥃', '🍸', '🥂', '🍹', '🧉',
  '😎', '🤩', '🥳', '😄', '🤪', '👑', '🔥', '💪',
  '🎉', '🎊', '🌟', '⭐', '🌈', '🦁', '🐼', '🦊',
];

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { themeColors, theme } = useTheme();
  const { t } = useTranslation();
  const { userProfile, updateProfile } = useAuth();
  const [name, setName] = useState(userProfile?.displayName || '');
  const [avatar, setAvatar] = useState(userProfile?.avatar || '🍻');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ displayName: name.trim(), avatar });
      onClose();
    } catch (error) {
      console.error('Edit profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  const cardShadow = theme === 'dark' ? shadows.cardDark : shadows.card;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, { backgroundColor: themeColors.surface }, cardShadow]}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {t.social.profile.editTitle}
          </Text>

          {/* Avatar */}
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            {t.social.profile.avatarLabel}
          </Text>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.avatarOption,
                  avatar === emoji && {
                    backgroundColor: themeColors.primarySoft,
                    borderColor: themeColors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setAvatar(emoji)}
              >
                <Text style={styles.avatarEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            {t.social.profile.nameLabel}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.surfaceLight,
                color: themeColors.text,
                borderColor: themeColors.border,
              },
            ]}
            placeholder={t.social.profile.namePlaceholder}
            placeholderTextColor={themeColors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={20}
            autoCapitalize="words"
          />

          {/* Save */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: themeColors.primary },
              !name.trim() && { opacity: 0.5 },
            ]}
            onPress={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveText}>{t.social.profile.saveButton}</Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
