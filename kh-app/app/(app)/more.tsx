import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Globe,
  Crown,
  Users,
  Truck,
  Building2,
  Bell,
  LifeBuoy,
  Info,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import { colors, spacing, radius } from '../../lib/theme/tokens';
import { TX, Row, Card, Avatar, Divider, FadeIn } from '../../components/ui';
import { KHLogo } from '../../components/KHLogo';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useAuth } from '../../lib/store/useAuth';
import type { Lang, Role } from '../../lib/types';

const ROLES: { role: Role; icon: any }[] = [
  { role: 'owner', icon: Crown },
  { role: 'staff', icon: Users },
  { role: 'supplier', icon: Truck },
];

function SettingRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const { isRTL } = useLocale();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  return (
    <Pressable onPress={onPress}>
      <Row justify="space-between" style={{ paddingVertical: spacing.md }}>
        <Row gap={12}>
          {icon}
          <TX weight="medium" color={danger ? colors.crimson : colors.textPrimary}>
            {label}
          </TX>
        </Row>
        {!danger ? <Chevron size={18} color={colors.textMuted} /> : null}
      </Row>
    </Pressable>
  );
}

export default function More() {
  const { t, tf, lang, setLang, isRTL } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user)!;
  const switchRole = useAuth((s) => s.switchRole);
  const signOut = useAuth((s) => s.signOut);

  const doSignOut = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  const langs: { code: Lang; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <FadeIn>
          <Row justify="space-between" style={{ marginBottom: spacing.xl }}>
            <Row gap={14}>
              <Avatar initials={user.avatar} size={56} />
              <View>
                <TX variant="h3" weight="bold">
                  {tf(user, 'name')}
                </TX>
                <TX variant="bodySm" color={colors.textSecondary}>
                  {tf(user, 'title')}
                </TX>
              </View>
            </Row>
            <KHLogo size={40} />
          </Row>
        </FadeIn>

        {/* Language */}
        <FadeIn delay={60}>
          <Row gap={8} style={{ marginBottom: spacing.sm }}>
            <Globe size={16} color={colors.textSecondary} />
            <TX variant="label" weight="semibold" color={colors.textSecondary}>
              {t('more.language').toUpperCase()}
            </TX>
          </Row>
          <Row gap={spacing.sm} style={{ marginBottom: spacing.xl }}>
            {langs.map((l) => {
              const on = lang === l.code;
              return (
                <Pressable key={l.code} onPress={() => setLang(l.code)} style={{ flex: 1 }}>
                  <View style={[styles.segment, on && { backgroundColor: colors.crimson, borderColor: colors.crimson }]}>
                    <TX weight="semibold" color={on ? colors.white : colors.textSecondary}>
                      {l.label}
                    </TX>
                  </View>
                </Pressable>
              );
            })}
          </Row>
        </FadeIn>

        {/* Role switch (demo) */}
        <FadeIn delay={100}>
          <TX variant="label" weight="semibold" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
            {t('more.switchRole').toUpperCase()}
          </TX>
          <Card padded style={{ marginBottom: spacing.xl }}>
            <Row gap={spacing.sm}>
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                const on = user.role === r.role;
                return (
                  <Pressable
                    key={r.role}
                    onPress={() => switchRole(r.role)}
                    style={{ flex: 1 }}>
                    <View style={[styles.roleTile, on && { backgroundColor: colors.crimsonTint, borderColor: colors.crimson }]}>
                      <Icon size={22} color={on ? colors.crimson : colors.textMuted} />
                      <TX variant="caption" weight={on ? 'bold' : 'medium'} color={on ? colors.crimson : colors.textSecondary} style={{ marginTop: 6 }}>
                        {t('auth.' + r.role)}
                      </TX>
                    </View>
                  </Pressable>
                );
              })}
            </Row>
          </Card>
        </FadeIn>

        {/* Workspace (owner/staff) */}
        {user.role !== 'supplier' ? (
          <FadeIn delay={130}>
            <Card padded style={{ marginBottom: spacing.xl }}>
              <SettingRow
                icon={<Building2 size={18} color={colors.crimson} />}
                label={t('nav.suppliers')}
                onPress={() => router.push('/(app)/suppliers')}
              />
            </Card>
          </FadeIn>
        ) : null}

        {/* Settings */}
        <FadeIn delay={140}>
          <Card padded>
            <SettingRow icon={<Bell size={18} color={colors.info} />} label={t('more.notifications')} />
            <Divider />
            <SettingRow icon={<LifeBuoy size={18} color={colors.success} />} label={t('more.support')} />
            <Divider />
            <SettingRow icon={<Info size={18} color={colors.wood} />} label={t('more.about')} />
            <Divider />
            <SettingRow icon={<LogOut size={18} color={colors.crimson} />} label={t('more.signOut')} onPress={doSignOut} danger />
          </Card>
        </FadeIn>

        <TX variant="caption" color={colors.textMuted} align="center" style={{ marginTop: spacing.xl }}>
          KH Timber & Co. · v1.0.0
        </TX>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTile: {
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
});
