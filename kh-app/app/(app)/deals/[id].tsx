import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ship, CheckCircle2, TreePine, Scale, MapPin, Calendar } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../lib/theme/tokens';
import { TX, Row, Card, Button, StatusPill, Divider, FadeIn } from '../../../components/ui';
import { Timeline } from '../../../components/Timeline';
import { HeroHeader } from '../../../components/HeroHeader';
import { Stars } from '../../../components/cards';
import { useLocale } from '../../../lib/i18n/LocaleProvider';
import { useAuth } from '../../../lib/store/useAuth';
import { useOps } from '../../../lib/store/useOps';
import { getDeal, getSupplier } from '../../../lib/store/selectors';
import { statusStyle } from '../../../lib/theme/status';
import { fmtMoney, fmtNumber, fmtDate } from '../../../lib/format';
import { IMAGES } from '../../../lib/data/seed';

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Row justify="space-between" style={{ paddingVertical: spacing.md }}>
      <Row gap={10}>
        {icon}
        <TX variant="bodySm" color={colors.textSecondary}>
          {label}
        </TX>
      </Row>
      <TX variant="bodySm" weight="semibold" style={{ flexShrink: 1, textAlign: 'right' }} numberOfLines={1}>
        {value}
      </TX>
    </Row>
  );
}

export default function DealDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tf, lang } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuth((s) => s.user?.role);
  const approvedDealIds = useOps((s) => s.approvedDealIds);
  const approveDeal = useOps((s) => s.approveDeal);
  const deal = getDeal(id);
  const approved = approvedDealIds.has(id);

  if (!deal) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 40, alignItems: 'center' }}>
        <TX>Not found</TX>
      </View>
    );
  }

  const supplier = getSupplier(deal.supplierId);
  const s = statusStyle(approved ? 'confirmed' : deal.status);
  const items = deal.timeline.map((e) => ({
    title: tf(e, 'label'),
    meta: e.date ? fmtDate(e.date, lang) : undefined,
    done: e.done,
  }));

  const approve = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    approveDeal(id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
        <HeroHeader
          image={IMAGES.timberDeck}
          title={tf(deal, 'title')}
          subtitle={deal.ref}
          height={220}
          onBack={() => router.back()}
          badge={<StatusPill {...s} label={t('status.' + (approved ? 'confirmed' : deal.status))} />}
        />

        <View style={{ padding: spacing.xl }}>
          {/* Supplier */}
          {supplier ? (
            <FadeIn>
              <Card onPress={() => role !== 'supplier' && router.push(`/(app)/suppliers/${supplier.id}`)} style={{ marginBottom: spacing.lg }}>
                <Row gap={12}>
                  <View style={[styles.logo, { backgroundColor: supplier.logoColor }]}>
                    <TX weight="bold" color={colors.white}>
                      {supplier.company.slice(0, 1)}
                    </TX>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TX variant="caption" color={colors.textMuted}>
                      {t('deals.supplier')}
                    </TX>
                    <TX weight="bold" numberOfLines={1}>
                      {supplier.company}
                    </TX>
                    <Row gap={6} style={{ marginTop: 2 }}>
                      <TX variant="bodySm">{supplier.countryCode}</TX>
                      <TX variant="bodySm" color={colors.textSecondary}>
                        {supplier.country}
                      </TX>
                    </Row>
                  </View>
                  {supplier.rating > 0 ? <Stars rating={supplier.rating} /> : null}
                </Row>
              </Card>
            </FadeIn>
          ) : null}

          {/* Details */}
          <FadeIn delay={60}>
            <TX variant="h3" weight="bold" style={{ marginBottom: spacing.sm }}>
              {t('deals.details')}
            </TX>
            <Card padded style={{ marginBottom: spacing.lg }}>
              <DetailRow icon={<TreePine size={16} color={colors.wood} />} label={t('deals.woodType')} value={tf(deal, 'woodType')} />
              <Divider />
              <DetailRow icon={<Scale size={16} color={colors.info} />} label={t('deals.volume')} value={`${fmtNumber(deal.volume, lang)} ${deal.unit}`} />
              <Divider />
              <DetailRow icon={<MapPin size={16} color={colors.crimson} />} label={t('deals.route')} value={`${deal.origin} → ${deal.destination}`} />
              <Divider />
              <DetailRow icon={<Calendar size={16} color={colors.textMuted} />} label={t('deals.created')} value={fmtDate(deal.createdAt, lang)} />
              <Divider />
              <Row justify="space-between" style={{ paddingTop: spacing.md }}>
                <TX variant="bodySm" color={colors.textSecondary}>
                  {t('deals.value')}
                </TX>
                <TX variant="h3" weight="extrabold" color={colors.crimson} style={{ fontVariant: ['tabular-nums'] }}>
                  {fmtMoney(deal.value, lang, deal.currency)}
                </TX>
              </Row>
            </Card>
          </FadeIn>

          {/* Timeline */}
          <FadeIn delay={120}>
            <TX variant="h3" weight="bold" style={{ marginBottom: spacing.md }}>
              {t('deals.timeline')}
            </TX>
            <Card padded style={{ marginBottom: spacing.lg }}>
              <Timeline items={items} />
            </Card>
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={160}>
            {deal.needsApproval && !approved && role === 'owner' ? (
              <Button label={t('deals.approveDeal')} leftIcon={<CheckCircle2 size={18} color={colors.white} />} onPress={approve} full size="lg" />
            ) : null}
            {deal.shipmentId ? (
              <View style={{ marginTop: deal.needsApproval ? spacing.md : 0 }}>
                <Button
                  label={t('deals.viewShipment')}
                  variant={deal.needsApproval && !approved ? 'secondary' : 'primary'}
                  leftIcon={<Ship size={18} color={deal.needsApproval && !approved ? colors.textPrimary : colors.white} />}
                  onPress={() => router.push(`/(app)/shipments/${deal.shipmentId}`)}
                  full
                  size="lg"
                />
              </View>
            ) : null}
          </FadeIn>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
