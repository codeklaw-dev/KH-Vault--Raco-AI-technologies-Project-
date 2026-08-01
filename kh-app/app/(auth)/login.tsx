import React from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Crown, Users, Truck, ChevronRight, ChevronLeft, Globe } from 'lucide-react-native';
import { colors, spacing, radius, shadow } from '../../lib/theme/tokens';
import { TX, Row, Press, FadeIn } from '../../components/ui';
import { KHLogo } from '../../components/KHLogo';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useAuth } from '../../lib/store/useAuth';
import { IMAGES } from '../../lib/data/seed';
import type { Role } from '../../lib/types';

const roleMeta: { role: Role; icon: any; color: string }[] = [
  { role: 'owner', icon: Crown, color: colors.crimson },
  { role: 'staff', icon: Users, color: colors.info },
  { role: 'supplier', icon: Truck, color: colors.wood },
];

export default function Login() {
  const { t, toggleLang, lang, isRTL } = useLocale();
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const insets = useSafeAreaInsets();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const pick = (role: Role) => {
    signIn(role);
    router.replace('/(app)/dashboard');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Hero */}
      <View style={{ height: 320 }}>
        <Image source={IMAGES.yard} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['rgba(126,20,26,0.78)', 'rgba(163,26,34,0.55)', 'rgba(20,17,15,0.9)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flex: 1, paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.xl }}>
          <Row justify="space-between">
            <View style={{ width: 40 }} />
            <Pressable onPress={toggleLang} style={styles.langBtn} hitSlop={8}>
              <Globe size={15} color={colors.white} />
              <TX variant="label" weight="semibold" color={colors.white}>
                {lang === 'en' ? 'العربية' : 'EN'}
              </TX>
            </Pressable>
          </Row>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
            <FadeIn>
              <KHLogo size={64} variant="crimson" />
              <TX variant="display" weight="extrabold" color={colors.white} style={{ marginTop: spacing.lg }}>
                {t('app.name')}
              </TX>
              <TX variant="body" color="rgba(255,255,255,0.85)" weight="medium" style={{ marginTop: 4 }}>
                {t('app.tagline')}
              </TX>
            </FadeIn>
          </View>
        </View>
      </View>

      {/* Sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xl }}>
        <FadeIn delay={120}>
          <TX variant="h1" weight="extrabold">
            {t('auth.welcome')}
          </TX>
          <TX variant="body" color={colors.textSecondary} style={{ marginTop: 4, marginBottom: spacing.xl }}>
            {t('auth.subtitle')}
          </TX>
        </FadeIn>

        <TX variant="label" weight="semibold" color={colors.textMuted} style={{ marginBottom: spacing.md, letterSpacing: 0.8 }}>
          {t('auth.continueAs').toUpperCase()}
        </TX>

        {roleMeta.map((m, i) => {
          const Icon = m.icon;
          return (
            <FadeIn key={m.role} delay={180 + i * 80}>
              <Press onPress={() => pick(m.role)} scaleTo={0.98} style={styles.roleCard}>
                <Row gap={14}>
                  <View style={[styles.roleIcon, { backgroundColor: m.color + '18' }]}>
                    <Icon size={22} color={m.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TX variant="h3" weight="bold">
                      {t('auth.' + m.role)}
                    </TX>
                    <TX variant="bodySm" color={colors.textSecondary} style={{ marginTop: 1 }}>
                      {t('auth.' + m.role + 'Desc')}
                    </TX>
                  </View>
                  <Chevron size={20} color={colors.textMuted} />
                </Row>
              </Press>
            </FadeIn>
          );
        })}

        <TX variant="caption" color={colors.textMuted} align="center" style={{ marginTop: spacing.xl }}>
          {t('auth.demoNote')}
        </TX>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  sheet: {
    flex: 1,
    marginTop: -24,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.soft,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
