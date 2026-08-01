import React, { useMemo, useState } from 'react';
import { View, FlatList, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Handshake } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../lib/theme/tokens';
import { TX, SearchBar, EmptyState, FadeIn } from '../../../components/ui';
import { DealCard } from '../../../components/cards';
import { useLocale } from '../../../lib/i18n/LocaleProvider';
import { useAuth } from '../../../lib/store/useAuth';
import { dealsForRole } from '../../../lib/store/selectors';
import type { DealStatus } from '../../../lib/types';

const FILTERS: (DealStatus | 'all')[] = ['all', 'negotiation', 'confirmed', 'in_production', 'shipped', 'delivered'];

export default function DealsList() {
  const { t, tf } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user)!;
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<DealStatus | 'all'>('all');

  const all = dealsForRole(user.role, user.supplierId);
  const data = useMemo(() => {
    return all.filter((d) => {
      const matchF = filter === 'all' || d.status === filter;
      const matchQ =
        !q ||
        tf(d, 'title').toLowerCase().includes(q.toLowerCase()) ||
        d.ref.toLowerCase().includes(q.toLowerCase());
      return matchF && matchQ;
    });
  }, [all, filter, q, tf]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TX variant="h1" weight="extrabold" style={{ marginBottom: spacing.md }}>
          {t('deals.title')}
        </TX>
        <SearchBar value={q} onChangeText={setQ} placeholder={t('deals.search')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: spacing.md }}>
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <Pressable key={f} onPress={() => setFilter(f)}>
                <View style={[styles.chip, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
                  <TX variant="bodySm" weight="semibold" color={on ? colors.white : colors.textSecondary}>
                    {f === 'all' ? t('deals.all') : t('status.' + f)}
                  </TX>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <FadeIn delay={index * 50}>
            <DealCard deal={item} onPress={() => router.push(`/(app)/deals/${item.id}`)} />
          </FadeIn>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Handshake size={40} color={colors.textMuted} />}
            title={t('deals.empty')}
            desc={t('deals.emptyDesc')}
          />
        }
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
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
});
