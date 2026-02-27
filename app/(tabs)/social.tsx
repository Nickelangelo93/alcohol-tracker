import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';
import { SocialProvider } from '../../src/context/SocialContext';
import { SessionProvider } from '../../src/context/SessionContext';
import { SocialSectionTabs } from '../../src/components/social/SocialSectionTabs';
import { AuthPrompt } from '../../src/components/social/AuthPrompt';
import { ProfileSetupModal } from '../../src/components/social/ProfileSetupModal';
import { FriendsSection } from '../../src/components/social/FriendsSection';
import { GroupsSection } from '../../src/components/social/GroupsSection';
import { LiveSessionSection } from '../../src/components/social/LiveSessionSection';
import { SocialSection } from '../../src/types/social';
import { spacing, fontSize } from '../../src/constants/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

function SocialContent() {
  const { themeColors } = useTheme();
  const { t } = useTranslation();
  const { user, userProfile, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<SocialSection>('friends');

  // Not signed in yet
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <AnimatedView entering={FadeIn.duration(500)} style={styles.headerContainer}>
              <Text style={[styles.header, { color: themeColors.text }]}>
                {t.social.title}
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                {t.social.subtitle}
              </Text>
            </AnimatedView>
            <AnimatedView entering={FadeInDown.delay(100).duration(500).springify().damping(18)}>
              <AuthPrompt />
            </AnimatedView>
            <View style={{ height: spacing.xxl }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Signed in but no profile yet
  if (!userProfile) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <AnimatedView entering={FadeIn.duration(500)} style={styles.headerContainer}>
              <Text style={[styles.header, { color: themeColors.text }]}>
                {t.social.title}
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                {t.social.subtitle}
              </Text>
            </AnimatedView>
            <AnimatedView entering={FadeInDown.delay(100).duration(500).springify().damping(18)}>
              <ProfileSetupModal />
            </AnimatedView>
            <View style={{ height: spacing.xxl }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Fully authenticated with profile
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AnimatedView entering={FadeIn.duration(500)} style={styles.headerContainer}>
            <Text style={[styles.header, { color: themeColors.text }]}>
              {t.social.title}
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {t.social.subtitle}
            </Text>
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(100).duration(500).springify().damping(18)}>
            <SocialSectionTabs
              activeSection={activeSection}
              onChangeSection={setActiveSection}
              labels={t.social.tabs}
            />
          </AnimatedView>

          <AnimatedView entering={FadeInDown.delay(200).duration(500).springify().damping(18)}>
            {activeSection === 'friends' && <FriendsSection />}
            {activeSection === 'groups' && <GroupsSection />}
            {activeSection === 'live' && <LiveSessionSection />}
          </AnimatedView>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default function SocialScreen() {
  return (
    <SocialProvider>
      <SessionProvider>
        <SocialContent />
      </SessionProvider>
    </SocialProvider>
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
});
