import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Handshake,
  Ship,
  TrendingUp,
  Building2,
  Globe,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { colors, spacing, radius, shadow } from '../../lib/theme/tokens';
import { TX, Row, SectionHeader, Card, Button, Avatar, FadeIn, Press } from '../../components/ui';
import { KpiHero, DealSlide, ShipmentSlide } from '../../components/cards';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useAuth } from '../../lib/store/useAuth';
import { useOps } from '../../lib/store/useOps';
import { dealsForRole, shipmentsForRole, pendingApprovals, getSupplier } from '../../lib/store/selectors';
import { fmtMoneyShort, fmtMoney, fmtNumber } from '../../lib/format';
import { kpis, IMAGES } from '../../lib/data/seed';

const KPI_W = 230;
const KPI_H = 220;
const DEAL_W = 260;
const SHIP_W = 270;
const DEAL_IMAGES = [IMAGES.timberDeck, IMAGES.yard, IMAGES.haulage, IMAGES.port, IMAGES.warehouse];

export default function Dashboard() {
  const { t, tf, lang, toggleLang, isRTL } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user)!;
  const role = user.role;
  const approvedDealIds = useOps((s) => s.approvedDealIds);
  const approveDeal = useOps((s) => s.approveDeal);
  const [approvalsOpen, setApprovalsOpen] = useState(true);
  const [dealsOpen, setDealsOpen] = useState(false);
  const [shipmentsOpen, setShipmentsOpen] = useState(false);

  const myDeals = dealsForRole(role, user.supplierId);
  const myShipments = shipmentsForRole(role, user.supplierId);
  const approvals = pendingApprovals().filter((d) => !approvedDealIds.has(d.id));

  const heroImg = role === 'owner' ? IMAGES.hq : role === 'staff' ? IMAGES.factory : IMAGES.office;

  const approve = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    approveDeal(id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ height: 210 }}>
          <Image source={heroImg} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(20,17,15,0.35)', 'rgba(126,20,26,0.82)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ flex: 1, paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.xl, justifyContent: 'space-between' }}>
            <Row justify="space-between">
              <View style={styles.roleBadge}>
                <TX variant="caption" weight="bold" color={colors.white}>
                  {t('auth.' + role).toUpperCase()}
                </TX>
              </View>
              <Row gap={10}>
                <Pressable onPress={toggleLang} style={styles.glassBtn} hitSlop={6}>
                  <Globe size={14} color={colors.white} />
                  <TX variant="label" weight="semibold" color={colors.white}>
                    {lang === 'en' ? 'ع' : 'EN'}
                  </TX>
                </Pressable>
                <Pressable onPress={() => router.push('/(app)/more')}>
                  <Avatar initials={user.avatar} size={38} color="rgba(255,255,255,0.22)" />
                </Pressable>
              </Row>
            </Row>
            <View style={{ marginBottom: spacing.xl }}>
              <TX variant="body" color="rgba(255,255,255,0.85)" weight="medium">
                {t('dash.greeting')},
              </TX>
              <TX variant="h1" weight="extrabold" color={colors.white}>
                {tf(user, 'name')}
              </TX>
            </View>
          </View>
        </View>

        <View style={{ padding: spacing.xl, marginTop: -spacing.lg }}>
          {/* KPIs */}
          {role !== 'supplier' ? (
            <FadeIn>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={KPI_W + spacing.md}
                decelerationRate="fast"
                style={{ marginHorizontal: -spacing.xl, marginBottom: spacing.xl }}
                contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
                <KpiHero
                  width={KPI_W}
                  height={KPI_H}
                  image={IMAGES.timberDeck}
                  label={t('dash.activeDeals')}
                  value={fmtNumber(kpis.activeDeals, lang)}
                  icon={<Handshake size={20} color={colors.white} />}
                  accent={colors.crimsonDeep}
                  onPress={() => router.push('/(app)/deals')}
                />
                <KpiHero
                  width={KPI_W}
                  height={KPI_H}
                  image={IMAGES.port}
                  label={`${t('dash.inTransit')} · ${fmtNumber(kpis.volumeYTD, lang)} m³`}
                  value={fmtNumber(kpis.inTransit, lang)}
                  icon={<Ship size={20} color={colors.white} />}
                  accent={colors.info}
                  onPress={() => router.push('/(app)/shipments')}
                />
                <KpiHero
                  width={KPI_W}
                  height={KPI_H}
                  image={IMAGES.warehouse}
                  label={t('dash.revenue')}
                  value={fmtMoneyShort(kpis.revenueYTD, lang)}
                  sub="+12.4%"
                  icon={<TrendingUp size={20} color={colors.white} />}
                  accent={colors.success}
                />
                <KpiHero
                  width={KPI_W}
                  height={KPI_H}
                  image={IMAGES.factory}
                  label={t('dash.suppliers')}
                  value={fmtNumber(kpis.suppliersActive, lang)}
                  icon={<Building2 size={20} color={colors.white} />}
                  accent={colors.wood}
                  onPress={() => router.push('/(app)/suppliers')}
                />
              </ScrollView>
            </FadeIn>
          ) : (
            <FadeIn>
              <Card style={{ marginBottom: spacing.xl, backgroundColor: colors.ink }} padded>
                <TX variant="label" color="rgba(255,255,255,0.7)" weight="semibold">
                  {getSupplier(user.supplierId!)?.company}
                </TX>
                <Row justify="space-between" style={{ marginTop: spacing.md }}>
                  <View>
                    <TX variant="h1" weight="extrabold" color={colors.white} style={{ fontVariant: ['tabular-nums'] }}>
                      {myDeals.length}
                    </TX>
                    <TX variant="caption" color="rgba(255,255,255,0.7)">
                      {t('dash.myDeals')}
                    </TX>
                  </View>
                  <View style={styles.vline} />
                  <View>
                    <TX variant="h1" weight="extrabold" color={colors.white} style={{ fontVariant: ['tabular-nums'] }}>
                      {myShipments.length}
                    </TX>
                    <TX variant="caption" color="rgba(255,255,255,0.7)">
                      {t('dash.myShipments')}
                    </TX>
                  </View>
                  <View style={styles.vline} />
                  <View>
                    <TX variant="h1" weight="extrabold" color={colors.white} style={{ fontVariant: ['tabular-nums'] }}>
                      {getSupplier(user.supplierId!)?.rating.toFixed(1)}
                    </TX>
                    <TX variant="caption" color="rgba(255,255,255,0.7)">
                      {t('sup.rating')}
                    </TX>
                  </View>
                </Row>
              </Card>
            </FadeIn>
          )}

          {/* Approvals (owner) */}
          {role === 'owner' && approvals.length > 0 ? (
            <FadeIn delay={80}>
              <View style={{ marginBottom: spacing.xl, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card }}>
                <Press
                  scaleTo={0.99}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setApprovalsOpen((o) => !o);
                  }}>
                  <LinearGradient
                    colors={[colors.crimson, colors.crimsonDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.approvalBanner, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Row gap={spacing.md} style={{ flex: 1 }}>
                      <View style={styles.approvalIcon}>
                        <AlertCircle size={20} color={colors.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <TX weight="bold" color={colors.white}>
                          {t('dash.needsApproval')}
                        </TX>
                        <TX variant="bodySm" color="rgba(255,255,255,0.85)" style={{ marginTop: 1 }}>
                          {approvals.length} {t('dash.pending')}
                        </TX>
                      </View>
                    </Row>
                    <Row gap={spacing.sm}>
                      <View style={styles.countBadgeLight}>
                        <TX variant="caption" weight="extrabold" color={colors.crimson}>
                          {approvals.length}
                        </TX>
                      </View>
                      {approvalsOpen ? (
                        <ChevronUp size={20} color={colors.white} />
                      ) : (
                        <ChevronDown size={20} color={colors.white} />
                      )}
                    </Row>
                  </LinearGradient>
                </Press>
                {approvalsOpen ? (
                  <View style={{ backgroundColor: colors.surface, padding: spacing.md, gap: spacing.md }}>
                    {approvals.map((d) => (
                      <Card key={d.id} style={{ borderColor: colors.crimsonSoft }}>
                        <Pressable onPress={() => router.push(`/(app)/deals/${d.id}`)}>
                          <TX variant="caption" weight="semibold" color={colors.crimson}>
                            {d.ref}
                          </TX>
                          <TX weight="bold" numberOfLines={1} style={{ marginTop: 2 }}>
                            {tf(d, 'title')}
                          </TX>
                          <TX variant="bodySm" color={colors.textSecondary} style={{ marginTop: 2 }}>
                            {fmtMoney(d.value, lang, d.currency)} · {fmtNumber(d.volume, lang)} {d.unit}
                          </TX>
                        </Pressable>
                        <Row gap={spacing.sm} style={{ marginTop: spacing.md }}>
                          <View style={{ flex: 1 }}>
                            <Button label={t('dash.approve')} leftIcon={<CheckCircle2 size={16} color={colors.white} />} onPress={() => approve(d.id)} full />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Button label={t('dash.review')} variant="secondary" onPress={() => router.push(`/(app)/deals/${d.id}`)} full />
                          </View>
                        </Row>
                      </Card>
                    ))}
                  </View>
                ) : null}
              </View>
            </FadeIn>
          ) : null}

          {/* Recent / My deals */}
          <FadeIn delay={120}>
            <View style={{ borderRadius: radius.lg, overflow: 'hidden', ...shadow.card }}>
              <Press
                scaleTo={0.99}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setDealsOpen((o) => !o);
                }}>
                <View style={{ height: 104 }}>
                  <Image source={IMAGES.timberDeck} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <LinearGradient
                    colors={['rgba(20,17,15,0.30)', 'rgba(126,20,26,0.88)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View
                    style={[
                      styles.dealsHeader,
                      isRTL && { flexDirection: 'row-reverse' },
                    ]}>
                    <Row gap={spacing.md} style={{ flex: 1 }}>
                      <View style={styles.approvalIcon}>
                        <Handshake size={20} color={colors.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <TX variant="h3" weight="extrabold" color={colors.white}>
                          {role === 'supplier' ? t('dash.myDeals') : t('dash.recentDeals')}
                        </TX>
                        <TX variant="bodySm" color="rgba(255,255,255,0.88)" style={{ marginTop: 1 }}>
                          {fmtNumber(myDeals.length, lang)} {t('nav.deals').toLowerCase()}
                        </TX>
                      </View>
                    </Row>
                    <Row gap={spacing.sm}>
                      <View style={styles.countBadgeLight}>
                        <TX variant="caption" weight="extrabold" color={colors.crimson}>
                          {fmtNumber(myDeals.length, lang)}
                        </TX>
                      </View>
                      {dealsOpen ? (
                        <ChevronUp size={20} color={colors.white} />
                      ) : (
                        <ChevronDown size={20} color={colors.white} />
                      )}
                    </Row>
                  </View>
                </View>
              </Press>
              {dealsOpen ? (
                <View style={{ backgroundColor: colors.surface, paddingVertical: spacing.md }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={DEAL_W + spacing.md}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.md }}>
                    {myDeals.map((d, i) => (
                      <DealSlide
                        key={d.id}
                        deal={d}
                        image={DEAL_IMAGES[i % DEAL_IMAGES.length]}
                        width={DEAL_W}
                        onPress={() => router.push(`/(app)/deals/${d.id}`)}
                      />
                    ))}
                  </ScrollView>
                  <Press onPress={() => router.push('/(app)/deals')} style={{ alignSelf: isRTL ? 'flex-start' : 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
                    <TX variant="bodySm" weight="semibold" color={colors.crimson}>
                      {t('dash.viewAll')}
                    </TX>
                  </Press>
                </View>
              ) : null}
            </View>
          </FadeIn>

          {/* Shipments */}
          <FadeIn delay={160}>
            <View style={{ marginTop: spacing.lg, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card }}>
              <Press
                scaleTo={0.99}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setShipmentsOpen((o) => !o);
                }}>
                <View style={{ height: 104 }}>
                  <Image source={IMAGES.port} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <LinearGradient
                    colors={['rgba(20,17,15,0.30)', 'rgba(126,20,26,0.88)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[styles.dealsHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Row gap={spacing.md} style={{ flex: 1 }}>
                      <View style={styles.approvalIcon}>
                        <Ship size={20} color={colors.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <TX variant="h3" weight="extrabold" color={colors.white}>
                          {role === 'supplier' ? t('dash.myShipments') : t('dash.activeShipments')}
                        </TX>
                        <TX variant="bodySm" color="rgba(255,255,255,0.88)" style={{ marginTop: 1 }}>
                          {fmtNumber(myShipments.length, lang)} {t('nav.shipments').toLowerCase()}
                        </TX>
                      </View>
                    </Row>
                    <Row gap={spacing.sm}>
                      <View style={styles.countBadgeLight}>
                        <TX variant="caption" weight="extrabold" color={colors.crimson}>
                          {fmtNumber(myShipments.length, lang)}
                        </TX>
                      </View>
                      {shipmentsOpen ? (
                        <ChevronUp size={20} color={colors.white} />
                      ) : (
                        <ChevronDown size={20} color={colors.white} />
                      )}
                    </Row>
                  </View>
                </View>
              </Press>
              {shipmentsOpen ? (
                <View style={{ backgroundColor: colors.surface, paddingVertical: spacing.md }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={SHIP_W + spacing.md}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.md }}>
                    {myShipments.map((s) => (
                      <ShipmentSlide
                        key={s.id}
                        shipment={s}
                        width={SHIP_W}
                        onPress={() => router.push(`/(app)/shipments/${s.id}`)}
                      />
                    ))}
                  </ScrollView>
                  <Press onPress={() => router.push('/(app)/shipments')} style={{ alignSelf: isRTL ? 'flex-start' : 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
                    <TX variant="bodySm" weight="semibold" color={colors.crimson}>
                      {t('dash.viewAll')}
                    </TX>
                  </Press>
                </View>
              ) : null}
            </View>
          </FadeIn>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  glassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  vline: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.18)' },
  countBadge: {
    backgroundColor: colors.crimson,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  approvalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  dealsHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  approvalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeLight: {
    backgroundColor: colors.white,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
});
