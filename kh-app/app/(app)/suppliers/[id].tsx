import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Mail, User, Calendar } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../lib/theme/tokens';
import { TX, Row, Card, StatusPill, Divider, FadeIn, SectionHeader } from '../../../components/ui';
import { Stars, DealCard } from '../../../components/cards';
import { useLocale } from '../../../lib/i18n/LocaleProvider';
import { getSupplier, dealsForSupplier } from '../../../lib/store/selectors';
import { statusStyle } from '../../../lib/theme/status';
import { fmtDate } from '../../../lib/format';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Row justify="space-between" style={{ paddingVertical: spacing.md }}>
      <Row gap={10}>
        {icon}
        <TX variant="bodySm" color={colors.textSecondary}>
          {label}
        </TX>
      </Row>
      <TX variant="bodySm" weight="semibold" numberOfLines={1} style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </TX>
    </Row>
  );
}

export default function SupplierDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang, isRTL } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const supplier = getSupplier(id);
  const Back = isRTL ? ChevronRight : ChevronLeft;

  if (!supplier) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 40, alignItems: 'center' }}>
        <TX>Not found</TX>
      </View>
    );
  }

  const s = statusStyle(supplier.status);
  const deals = dealsForSupplier(supplier.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
        {/* Header band */}
        <View style={[styles.band, { paddingTop: insets.top + spacing.sm, backgroundColor: supplier.logoColor }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Back size={22} color={colors.white} />
          </Pressable>
          <View style={{ alignItems: 'center', paddingBottom: spacing.xl }}>
            <View style={styles.bigLogo}>
              <TX variant="display" weight="extrabold" color={colors.white}>
                {supplier.company.slice(0, 1)}
              </TX>
            </View>
            <TX variant="h2" weight="extrabold" color={colors.white} align="center" style={{ marginTop: spacing.md }}>
              {supplier.company}
            </TX>
            <Row gap={6} style={{ marginTop: 6 }}>
              <TX color="rgba(255,255,255,0.9)">{supplier.countryCode}</TX>
              <TX color="rgba(255,255,255,0.9)" weight="medium">
                {supplier.country}
              </TX>
            </Row>
            <View style={{ marginTop: spacing.md }}>
              <StatusPill {...s} label={t('status.' + supplier.status)} />
            </View>
          </View>
        </View>

        <View style={{ padding: spacing.xl }}>
          {supplier.rating > 0 ? (
            <FadeIn>
              <Card padded style={{ marginBottom: spacing.lg }}>
                <Row justify="space-between">
                  <View>
                    <TX variant="caption" color={colors.textMuted}>
                      {t('sup.rating')}
                    </TX>
                    <Row gap={8} style={{ marginTop: 4 }}>
                      <TX variant="h2" weight="extrabold">
                        {supplier.rating.toFixed(1)}
                      </TX>
                      <View style={{ justifyContent: 'center' }}>
                        <Stars rating={supplier.rating} />
                      </View>
                    </Row>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <TX variant="caption" color={colors.textMuted}>
                      {t('sup.activeDeals')}
                    </TX>
                    <TX variant="h2" weight="extrabold" style={{ marginTop: 4 }}>
                      {supplier.activeDeals}
                    </TX>
                  </View>
                </Row>
              </Card>
            </FadeIn>
          ) : null}

          <FadeIn delay={60}>
            <Card padded style={{ marginBottom: spacing.lg }}>
              <InfoRow icon={<User size={16} color={colors.info} />} label={t('sup.contact')} value={supplier.contact} />
              <Divider />
              <InfoRow icon={<Mail size={16} color={colors.crimson} />} label="Email" value={supplier.email} />
              <Divider />
              <InfoRow icon={<Calendar size={16} color={colors.textMuted} />} label={t('sup.onboarded')} value={fmtDate(supplier.onboarded, lang)} />
            </Card>
          </FadeIn>

          <FadeIn delay={100}>
            <TX variant="label" weight="semibold" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
              {t('sup.categories').toUpperCase()}
            </TX>
            <Row gap={8} style={{ flexWrap: 'wrap', marginBottom: spacing.lg }}>
              {supplier.categories.map((c) => (
                <View key={c} style={styles.catChip}>
                  <TX variant="bodySm" weight="semibold" color={colors.wood}>
                    {c}
                  </TX>
                </View>
              ))}
            </Row>
          </FadeIn>

          {deals.length > 0 ? (
            <FadeIn delay={140}>
              <SectionHeader title={t('deals.title')} />
              {deals.map((d) => (
                <DealCard key={d.id} deal={d} onPress={() => router.push(`/(app)/deals/${d.id}`)} />
              ))}
            </FadeIn>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { paddingHorizontal: spacing.xl },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigLogo: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
});
