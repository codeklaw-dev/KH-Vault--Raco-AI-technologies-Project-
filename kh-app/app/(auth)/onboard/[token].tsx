import React, { useState } from 'react';
import { View, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Globe } from 'lucide-react-native';
import { colors, spacing, radius, shadow } from '../../../lib/theme/tokens';
import { TX, Row, Button, Press, FadeIn } from '../../../components/ui';
import { KHLogo } from '../../../components/KHLogo';
import { useLocale } from '../../../lib/i18n/LocaleProvider';
import { useAuth } from '../../../lib/store/useAuth';

const CATS = ['Teak', 'Oak', 'Pine', 'Walnut', 'Ipê', 'Sapele', 'Plywood', 'Veneer'];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'email-address' | 'default';
}) {
  const { f, isRTL } = useLocale();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <TX variant="label" weight="semibold" color={colors.textSecondary} style={{ marginBottom: 6 }}>
        {label}
      </TX>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        style={[
          styles.input,
          { fontFamily: f('medium'), textAlign: isRTL ? 'right' : 'left' },
        ]}
      />
    </View>
  );
}

export default function Onboard() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { t, toggleLang, lang } = useLocale();
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const insets = useSafeAreaInsets();

  const [done, setDone] = useState(false);
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [cats, setCats] = useState<string[]>([]);

  const toggleCat = (c: string) =>
    setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const enter = () => {
    signIn('supplier');
    router.replace('/(app)/dashboard');
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
        <View style={styles.successWrap}>
          <FadeIn>
            <View style={styles.successIcon}>
              <CheckCircle2 size={56} color={colors.success} strokeWidth={2} />
            </View>
            <TX variant="h1" weight="extrabold" align="center" style={{ marginTop: spacing.xl }}>
              {t('onboard.success')}
            </TX>
            <TX variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8, marginBottom: spacing.xxl }}>
              {t('onboard.successDesc')}
            </TX>
            <Button label={t('onboard.enter')} onPress={enter} full size="lg" />
          </FadeIn>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ backgroundColor: colors.crimson, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl, paddingHorizontal: spacing.xl }}>
        <Row justify="space-between" style={{ marginBottom: spacing.lg }}>
          <KHLogo size={40} variant="crimson" />
          <Pressable onPress={toggleLang} style={styles.langBtn} hitSlop={8}>
            <Globe size={14} color={colors.white} />
            <TX variant="label" weight="semibold" color={colors.white}>
              {lang === 'en' ? 'العربية' : 'EN'}
            </TX>
          </Pressable>
        </Row>
        <TX variant="label" weight="semibold" color="rgba(255,255,255,0.8)">
          {t('onboard.invitedBy')} · {t('app.name')}
        </TX>
        <TX variant="h1" weight="extrabold" color={colors.white} style={{ marginTop: 4 }}>
          {t('onboard.title')}
        </TX>
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: -16, backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xxl }}>
        <FadeIn>
          <TX variant="bodySm" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
            {t('onboard.intro')}
          </TX>

          <Field label={t('onboard.company')} value={company} onChangeText={setCompany} placeholder="Amazon Timber Exports" />
          <Field label={t('onboard.contact')} value={contact} onChangeText={setContact} placeholder="Marco Silva" />
          <Field label={t('onboard.email')} value={email} onChangeText={setEmail} placeholder="you@company.com" keyboardType="email-address" />
          <Field label={t('onboard.country')} value={country} onChangeText={setCountry} placeholder="Brazil" />

          <TX variant="label" weight="semibold" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
            {t('onboard.categories')}
          </TX>
          <View style={styles.chips}>
            {CATS.map((c) => {
              const on = cats.includes(c);
              return (
                <Press key={c} onPress={() => toggleCat(c)} scaleTo={0.95}>
                  <View style={[styles.chip, on && { backgroundColor: colors.crimson, borderColor: colors.crimson }]}>
                    <TX variant="bodySm" weight="semibold" color={on ? colors.white : colors.textSecondary}>
                      {c}
                    </TX>
                  </View>
                </Press>
              );
            })}
          </View>

          <View style={{ marginTop: spacing.xxl }}>
            <Button label={t('onboard.submit')} onPress={() => setDone(true)} full size="lg" />
          </View>
        </FadeIn>
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
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 50,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successTint,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
