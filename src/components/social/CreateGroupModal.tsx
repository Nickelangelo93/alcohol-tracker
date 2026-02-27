import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useSocial } from '../../context/SocialContext';
import { spacing, borderRadius, fontSize } from '../../constants/theme';

const GROUP_EMOJIS = ['🍻', '🍺', '🍷', '🥃', '🎉', '🔥', '👑', '🌟', '🎊', '🥂', '🍸', '🍹'];

interface Props {
  onClose: () => void;
}

export function CreateGroupModal({ onClose }: Props) {
  const { themeColors } = useTheme();
  const { t } = useTranslation();
  const { friends, createGroup } = useSocial();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍻');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const toggleFriend = (uid: string) => {
    setSelectedFriends((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createGroup(name.trim(), emoji, selectedFriends);
      onClose();
    } catch (error) {
      console.error('Create group error:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              {t.social.groups.createTitle}
            </Text>

            {/* Group Emoji */}
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.social.groups.emojiLabel}
            </Text>
            <View style={styles.emojiRow}>
              {GROUP_EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiOption,
                    emoji === e && { backgroundColor: themeColors.primarySoft, borderColor: themeColors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Group Name */}
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>
              {t.social.groups.nameLabel}
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
              placeholder={t.social.groups.namePlaceholder}
              placeholderTextColor={themeColors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={30}
            />

            {/* Friends to add */}
            {friends.length > 0 && (
              <>
                <Text style={[styles.label, { color: themeColors.textSecondary }]}>
                  {t.social.groups.membersLabel}
                </Text>
                {friends.map((friend) => {
                  const selected = selectedFriends.includes(friend.uid);
                  return (
                    <TouchableOpacity
                      key={friend.uid}
                      style={[
                        styles.friendRow,
                        { borderBottomColor: themeColors.border },
                        selected && { backgroundColor: themeColors.primarySoft },
                      ]}
                      onPress={() => toggleFriend(friend.uid)}
                    >
                      <View style={styles.friendLeft}>
                        <Text style={styles.friendAvatar}>{friend.avatar}</Text>
                        <Text style={[styles.friendName, { color: themeColors.text }]}>
                          {friend.displayName}
                        </Text>
                      </View>
                      <View style={[
                        styles.checkbox,
                        { borderColor: themeColors.primary },
                        selected && { backgroundColor: themeColors.primary },
                      ]}>
                        {selected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: themeColors.surfaceLight }]}
                onPress={onClose}
              >
                <Text style={[styles.cancelText, { color: themeColors.text }]}>
                  {t.modal.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  { backgroundColor: themeColors.primary },
                  !name.trim() && { opacity: 0.5 },
                ]}
                onPress={handleCreate}
                disabled={!name.trim() || creating}
              >
                {creating ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.createText}>{t.social.groups.createButton}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '80%',
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
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiText: {
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
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderRadius: borderRadius.sm,
    marginBottom: 2,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  friendAvatar: {
    fontSize: 20,
  },
  friendName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  createBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  createText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
