import React, { useMemo, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Building2, Copy, Check, Link2 } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../lib/theme/tokens';
import { TX, Row, SearchBar, EmptyState, FadeIn } from '../../../components/ui';
import { SupplierCard } from '../../../components/cards';
import { useLocale } from '../../../lib/i18n/LocaleProvider';
import { suppliers } from '../../../lib/data/seed';

const INVITE_LINK = 'khtimber.app/onboard/INV-8F3K';

export default function SuppliersList() {
  const { t } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState(false);

  const data = useMemo(
    () => suppliers.filter((s) => !q || s.company.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const copy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://' + INVITE_LINK).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TX variant="h1" weight="extrabold" style={{ marginBottom: spacing.md }}>
          {t('sup.title')}
        </TX>
        <SearchBar value={q} onChangeText={setQ} placeholder={t('sup.search')} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FadeIn>
            <View style={styles.invite}>
              <Row gap={10} style={{ marginBottom: spacing.md }}>
                <View style={styles.inviteIcon}>
                  <Link2 size={18} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <TX weight="bold" color={colors.white}>
                    {t('sup.invite')}
                  </TX>
                  <TX variant="caption" color="rgba(255,255,255,0.75)">
                    {t('sup.inviteDesc')}
                  </TX>
                </View>
              </Row>
              <Pressable onPress={copy} style={styles.linkRow}>
                <TX variant="bodySm" weight="semibold" color={colors.white} numberOfLines={1} style={{ flex: 1 }}>
                  {INVITE_LINK}
                </TX>
                {copied ? <Check size={18} color={colors.white} /> : <Copy size={16} color="rgba(255,255,255,0.9)" />}
              </Pressable>
              {copied ? (
                <TX variant="caption" color="rgba(255,255,255,0.9)" style={{ marginTop: 6 }}>
                  {t('sup.linkCopied')}
                </TX>
              ) : null}
            </View>
          </FadeIn>
        }
        renderItem={({ item, index }) => (
          <FadeIn delay={index * 40}>
            <SupplierCard supplier={item} onPress={() => router.push(`/(app)/suppliers/${item.id}`)} />
          </FadeIn>
        )}
        ListEmptyComponent={<EmptyState icon={<Building2 size={40} color={colors.textMuted} />} title={t('sup.empty')} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  invite: {
    backgroundColor: colors.crimson,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  inviteIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
