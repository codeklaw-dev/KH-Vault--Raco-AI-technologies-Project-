import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ship, Truck, Plane, FileText, Calendar, Anchor, RefreshCw } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../lib/theme/tokens';
import { TX, Row, Card, Button, StatusPill, ProgressBar, Divider, FadeIn } from '../../../components/ui';
import { Timeline } from '../../../components/Timeline';
import { HeroHeader } from '../../../components/HeroHeader';
import { useLocale } from '../../../lib/i18n/LocaleProvider';
import { useAuth } from '../../../lib/store/useAuth';
import { getShipment } from '../../../lib/store/selectors';
import { statusStyle } from '../../../lib/theme/status';
import { fmtDate, fmtDateTime } from '../../../lib/format';

const tIcon = { sea: Ship, road: Truck, air: Plane };

export default function ShipmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tf, lang } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuth((s) => s.user?.role);
  const shipment = getShipment(id);

  if (!shipment) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 40, alignItems: 'center' }}>
        <TX>Not found</TX>
      </View>
    );
  }

  const s = statusStyle(shipment.status);
  const Icon = tIcon[shipment.transport];
  const items = shipment.milestones.map((m) => ({
    title: tf(m, 'label'),
    subtitle: tf(m, 'location'),
    meta: m.timestamp ? fmtDateTime(m.timestamp, lang) : undefined,
    done: m.done,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
        <HeroHeader
          image={shipment.heroImage}
          title={`${tf(shipment, 'origin')} → ${tf(shipment, 'destination')}`}
          subtitle={shipment.ref}
          height={230}
          onBack={() => router.back()}
          badge={<StatusPill {...s} label={t('status.' + shipment.status)} />}
        />

        <View style={{ padding: spacing.xl }}>
          {/* Progress */}
          <FadeIn>
            <Card padded style={{ marginBottom: spacing.lg }}>
              <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
                <Row gap={8}>
                  <Icon size={18} color={colors.crimson} />
                  <TX weight="semibold">{t('ship.' + shipment.transport)}</TX>
                </Row>
                <TX variant="h3" weight="extrabold" color={colors.crimson} style={{ fontVariant: ['tabular-nums'] }}>
                  {shipment.progressPct}%
                </TX>
              </Row>
              <ProgressBar pct={shipment.progressPct} />
              <Divider style={{ marginVertical: spacing.lg }} />
              <Row justify="space-between">
                <Row gap={8}>
                  <Calendar size={15} color={colors.textMuted} />
                  <TX variant="bodySm" color={colors.textSecondary}>
                    {t('ship.eta')}
                  </TX>
                </Row>
                <TX variant="bodySm" weight="bold">
                  {fmtDate(shipment.eta, lang)}
                </TX>
              </Row>
              <Row justify="space-between" style={{ marginTop: spacing.md }}>
                <Row gap={8}>
                  <Anchor size={15} color={colors.textMuted} />
                  <TX variant="bodySm" color={colors.textSecondary}>
                    {t('ship.vessel')}
                  </TX>
                </Row>
                <TX variant="bodySm" weight="semibold" numberOfLines={1} style={{ flexShrink: 1, textAlign: 'right' }}>
                  {shipment.vessel}
                </TX>
              </Row>
            </Card>
          </FadeIn>

          {/* Tracking */}
          <FadeIn delay={80}>
            <TX variant="h3" weight="bold" style={{ marginBottom: spacing.md }}>
              {t('ship.milestones')}
            </TX>
            <Card padded style={{ marginBottom: spacing.lg }}>
              <Timeline items={items} />
            </Card>
          </FadeIn>

          {/* Documents */}
          <FadeIn delay={140}>
            <TX variant="h3" weight="bold" style={{ marginBottom: spacing.md }}>
              {t('ship.documents')}
            </TX>
            <Card padded style={{ marginBottom: spacing.lg }}>
              {shipment.documents.map((doc, i) => (
                <View key={doc.name}>
                  {i > 0 ? <Divider style={{ marginVertical: spacing.sm }} /> : null}
                  <Row gap={12} style={{ paddingVertical: spacing.xs }}>
                    <View style={styles.docIcon}>
                      <FileText size={18} color={colors.crimson} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TX variant="bodySm" weight="semibold" numberOfLines={1}>
                        {doc.name}
                      </TX>
                      <TX variant="caption" color={colors.textMuted}>
                        {doc.size}
                      </TX>
                    </View>
                  </Row>
                </View>
              ))}
            </Card>
          </FadeIn>

          {/* Action */}
          {role !== 'owner' && shipment.status !== 'delivered' ? (
            <FadeIn delay={180}>
              <Button
                label={t('ship.updateStatus')}
                leftIcon={<RefreshCw size={17} color={colors.white} />}
                onPress={() => {}}
                full
                size="lg"
              />
            </FadeIn>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.crimsonTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
