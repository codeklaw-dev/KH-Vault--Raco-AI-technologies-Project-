import React from 'react';
import { View, StyleSheet, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ship, Truck, Plane, Star, MapPin, ArrowRight, ArrowLeft, TrendingUp } from 'lucide-react-native';
import { colors, spacing, radius, shadow } from '../lib/theme/tokens';
import { Card, Row, TX, StatusPill, ProgressBar, Press } from './ui';
import { statusStyle } from '../lib/theme/status';
import { useLocale } from '../lib/i18n/LocaleProvider';
import { fmtMoney, fmtNumber, fmtDate } from '../lib/format';
import { getSupplier, getDeal } from '../lib/store/selectors';
import type { Deal, Shipment, Supplier } from '../lib/types';

export function KpiHero({
  image,
  label,
  value,
  sub,
  icon,
  accent = colors.crimson,
  width,
  height = 168,
  onPress,
}: {
  image: ImageSourcePropType;
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  width: number;
  height?: number;
  onPress?: () => void;
}) {
  const { isRTL } = useLocale();
  return (
    <Press onPress={onPress} scaleTo={0.97} style={{ width, height, borderRadius: radius.lg, ...shadow.card }}>
      <View style={{ flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.ink }}>
        <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        <LinearGradient
          colors={['rgba(20,17,15,0.10)', 'rgba(20,17,15,0.55)', accent + 'F2']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'space-between' }}>
          <Row justify="space-between" align="flex-start">
            <View style={khStyles.glassIcon}>{icon}</View>
            {sub ? (
              <View style={khStyles.subBadge}>
                <TrendingUp size={11} color={colors.white} />
                <TX variant="label" weight="bold" color={colors.white} style={{ fontVariant: ['tabular-nums'] }}>
                  {sub}
                </TX>
              </View>
            ) : null}
          </Row>
          <View>
            <TX
              variant="display"
              weight="extrabold"
              color={colors.white}
              style={{ fontVariant: ['tabular-nums'], textAlign: isRTL ? 'right' : 'left' }}>
              {value}
            </TX>
            <TX
              variant="bodySm"
              weight="semibold"
              color="rgba(255,255,255,0.88)"
              numberOfLines={1}
              style={{ marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
              {label}
            </TX>
          </View>
        </View>
      </View>
    </Press>
  );
}

const khStyles = StyleSheet.create({
  glassIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  refChip: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  slideTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  slideFill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
});

function RouteRow({ from, to }: { from: string; to: string }) {
  const { isRTL } = useLocale();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  return (
    <Row gap={6}>
      <MapPin size={13} color={colors.textMuted} />
      <TX variant="bodySm" color={colors.textSecondary} numberOfLines={1} style={{ flexShrink: 1 }}>
        {from}
      </TX>
      <Arrow size={12} color={colors.textMuted} />
      <TX variant="bodySm" color={colors.textSecondary} numberOfLines={1} style={{ flexShrink: 1 }}>
        {to}
      </TX>
    </Row>
  );
}

export function DealCard({ deal, onPress }: { deal: Deal; onPress?: () => void }) {
  const { t, tf, lang } = useLocale();
  const s = statusStyle(deal.status);
  const supplier = getSupplier(deal.supplierId);
  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }}>
      <Row justify="space-between" align="flex-start" style={{ marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TX variant="caption" weight="semibold" color={colors.crimson}>
            {deal.ref}
          </TX>
          <TX variant="h3" weight="bold" numberOfLines={2} style={{ marginTop: 2 }}>
            {tf(deal, 'title')}
          </TX>
        </View>
        <StatusPill {...s} label={t('status.' + deal.status)} />
      </Row>
      {supplier ? (
        <Row gap={6} style={{ marginBottom: spacing.sm }}>
          <TX variant="bodySm">{supplier.countryCode}</TX>
          <TX variant="bodySm" color={colors.textSecondary} numberOfLines={1}>
            {supplier.company}
          </TX>
        </Row>
      ) : null}
      <RouteRow from={deal.origin} to={deal.destination} />
      <Row justify="space-between" style={{ marginTop: spacing.md }}>
        <View>
          <TX variant="caption" color={colors.textMuted}>
            {t('deals.value')}
          </TX>
          <TX weight="bold" style={{ fontVariant: ['tabular-nums'] }}>
            {fmtMoney(deal.value, lang, deal.currency)}
          </TX>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <TX variant="caption" color={colors.textMuted}>
            {t('deals.volume')}
          </TX>
          <TX weight="bold" style={{ fontVariant: ['tabular-nums'] }}>
            {fmtNumber(deal.volume, lang)} {deal.unit}
          </TX>
        </View>
      </Row>
    </Card>
  );
}

export function DealSlide({
  deal,
  image,
  width,
  onPress,
}: {
  deal: Deal;
  image: ImageSourcePropType;
  width: number;
  onPress?: () => void;
}) {
  const { t, tf, lang, isRTL } = useLocale();
  const s = statusStyle(deal.status);
  const supplier = getSupplier(deal.supplierId);
  const align = isRTL ? 'right' : 'left';
  return (
    <Press onPress={onPress} scaleTo={0.97} style={{ width, height: 190, borderRadius: radius.lg, ...shadow.card }}>
      <View style={{ flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.ink }}>
        <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        <LinearGradient
          colors={['rgba(20,17,15,0.15)', 'rgba(20,17,15,0.55)', 'rgba(20,17,15,0.92)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'space-between' }}>
          <Row justify="space-between" align="flex-start">
            <View style={khStyles.refChip}>
              <TX variant="label" weight="bold" color={colors.white}>
                {deal.ref}
              </TX>
            </View>
            <StatusPill {...s} label={t('status.' + deal.status)} />
          </Row>
          <View>
            <TX variant="h3" weight="bold" color={colors.white} numberOfLines={2} style={{ textAlign: align }}>
              {tf(deal, 'title')}
            </TX>
            {supplier ? (
              <Row gap={5} style={{ marginTop: 4 }}>
                <TX variant="bodySm" color="rgba(255,255,255,0.9)">{supplier.countryCode}</TX>
                <TX variant="bodySm" color="rgba(255,255,255,0.78)" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {supplier.company}
                </TX>
              </Row>
            ) : null}
            <Row justify="space-between" style={{ marginTop: spacing.sm }}>
              <TX weight="extrabold" color={colors.white} style={{ fontVariant: ['tabular-nums'] }}>
                {fmtMoney(deal.value, lang, deal.currency)}
              </TX>
              <TX variant="bodySm" weight="semibold" color="rgba(255,255,255,0.85)" style={{ fontVariant: ['tabular-nums'] }}>
                {fmtNumber(deal.volume, lang)} {deal.unit}
              </TX>
            </Row>
          </View>
        </View>
      </View>
    </Press>
  );
}

const transportIcon = {
  sea: Ship,
  road: Truck,
  air: Plane,
};

export function ShipmentSlide({
  shipment,
  width,
  onPress,
}: {
  shipment: Shipment;
  width: number;
  onPress?: () => void;
}) {
  const { t, tf, lang, isRTL } = useLocale();
  const s = statusStyle(shipment.status);
  const Icon = transportIcon[shipment.transport];
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const align = isRTL ? 'right' : 'left';
  const deal = getDeal(shipment.dealId);
  const fullTitle = deal ? tf(deal, 'title') : shipment.ref;
  const parts = fullTitle.split('—');
  const client = parts.length > 1 ? parts[parts.length - 1].trim() : fullTitle;
  const product = parts.length > 1 ? parts[0].trim() : '';
  return (
    <Press onPress={onPress} scaleTo={0.97} style={{ width, height: 220, borderRadius: radius.lg, ...shadow.card }}>
      <View style={{ flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.ink }}>
        <Image source={shipment.heroImage} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        <LinearGradient
          colors={['rgba(20,17,15,0.15)', 'rgba(20,17,15,0.55)', 'rgba(20,17,15,0.94)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flex: 1, padding: spacing.lg, justifyContent: 'space-between' }}>
          <Row justify="space-between" align="flex-start">
            <View style={khStyles.refChip}>
              <Row gap={5}>
                <Icon size={12} color={colors.white} />
                <TX variant="label" weight="bold" color={colors.white}>
                  {shipment.ref}
                </TX>
              </Row>
            </View>
            <StatusPill {...s} label={t('status.' + shipment.status)} />
          </Row>
          <View>
            <TX variant="h3" weight="bold" color={colors.white} numberOfLines={1} style={{ textAlign: align }}>
              {client}
            </TX>
            <Row gap={6} style={{ marginTop: 3 }}>
              {product ? (
                <TX variant="bodySm" color="rgba(255,255,255,0.85)" numberOfLines={1}>
                  {product} ·
                </TX>
              ) : null}
              <TX variant="bodySm" color="rgba(255,255,255,0.78)" numberOfLines={1} style={{ flexShrink: 1 }}>
                {tf(shipment, 'origin')}
              </TX>
              <Arrow size={12} color="rgba(255,255,255,0.7)" />
              <TX variant="bodySm" color="rgba(255,255,255,0.78)" numberOfLines={1} style={{ flexShrink: 1 }}>
                {tf(shipment, 'destination')}
              </TX>
            </Row>
            <View style={{ marginTop: spacing.md }}>
              <View style={khStyles.slideTrack}>
                <View style={[khStyles.slideFill, { width: `${shipment.progressPct}%` }]} />
              </View>
              <Row justify="space-between" style={{ marginTop: 7 }}>
                <TX variant="caption" weight="bold" color={colors.white} style={{ fontVariant: ['tabular-nums'] }}>
                  {shipment.progressPct}%
                </TX>
                <TX variant="caption" weight="semibold" color="rgba(255,255,255,0.85)">
                  {t('ship.eta')} {fmtDate(shipment.eta, lang)}
                </TX>
              </Row>
            </View>
          </View>
        </View>
      </View>
    </Press>
  );
}

export function ShipmentCard({ shipment, onPress }: { shipment: Shipment; onPress?: () => void }) {
  const { t, tf, lang } = useLocale();
  const s = statusStyle(shipment.status);
  const Icon = transportIcon[shipment.transport];
  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }}>
      <Row justify="space-between" align="flex-start" style={{ marginBottom: spacing.sm }}>
        <Row gap={10}>
          <View style={styles_iconWrap}>
            <Icon size={18} color={colors.crimson} />
          </View>
          <View>
            <TX variant="caption" weight="semibold" color={colors.crimson}>
              {shipment.ref}
            </TX>
            <TX weight="bold">{t('ship.' + shipment.transport)}</TX>
          </View>
        </Row>
        <StatusPill {...s} label={t('status.' + shipment.status)} />
      </Row>
      <RouteRow from={tf(shipment, 'origin')} to={tf(shipment, 'destination')} />
      <View style={{ marginTop: spacing.md }}>
        <Row justify="space-between" style={{ marginBottom: 6 }}>
          <TX variant="caption" color={colors.textMuted}>
            {t('ship.progress')}
          </TX>
          <TX variant="caption" weight="bold" color={colors.crimson} style={{ fontVariant: ['tabular-nums'] }}>
            {shipment.progressPct}%
          </TX>
        </Row>
        <ProgressBar pct={shipment.progressPct} />
        <Row justify="space-between" style={{ marginTop: 8 }}>
          <TX variant="caption" color={colors.textMuted}>
            {t('ship.eta')}
          </TX>
          <TX variant="caption" weight="semibold" color={colors.textSecondary}>
            {fmtDate(shipment.eta, lang)}
          </TX>
        </Row>
      </View>
    </Card>
  );
}

const styles_iconWrap = {
  width: 40,
  height: 40,
  borderRadius: radius.md,
  backgroundColor: colors.crimsonTint,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export function Stars({ rating }: { rating: number }) {
  return (
    <Row gap={2}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          color={colors.warning}
          fill={i <= Math.round(rating) ? colors.warning : 'transparent'}
        />
      ))}
    </Row>
  );
}

export function SupplierCard({ supplier, onPress }: { supplier: Supplier; onPress?: () => void }) {
  const { t } = useLocale();
  const s = statusStyle(supplier.status);
  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }}>
      <Row justify="space-between" align="flex-start">
        <Row gap={10} style={{ flex: 1 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: supplier.logoColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TX weight="bold" color={colors.white}>
              {supplier.company.slice(0, 1)}
            </TX>
          </View>
          <View style={{ flex: 1 }}>
            <TX weight="bold" numberOfLines={1}>
              {supplier.company}
            </TX>
            <Row gap={5} style={{ marginTop: 2 }}>
              <TX variant="bodySm">{supplier.countryCode}</TX>
              <TX variant="bodySm" color={colors.textSecondary}>
                {supplier.country}
              </TX>
            </Row>
          </View>
        </Row>
        <StatusPill {...s} label={t('status.' + supplier.status)} />
      </Row>
      <Row justify="space-between" style={{ marginTop: spacing.md }}>
        {supplier.rating > 0 ? <Stars rating={supplier.rating} /> : <View />}
        <TX variant="bodySm" color={colors.textSecondary}>
          {supplier.activeDeals} {t('sup.activeDeals')}
        </TX>
      </Row>
    </Card>
  );
}
