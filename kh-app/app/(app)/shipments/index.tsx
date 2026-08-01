import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ship } from 'lucide-react-native';
import { colors, spacing } from '../../../lib/theme/tokens';
import { TX, SearchBar, EmptyState, FadeIn } from '../../../components/ui';
import { ShipmentCard } from '../../../components/cards';
import { useLocale } from '../../../lib/i18n/LocaleProvider';
import { useAuth } from '../../../lib/store/useAuth';
import { shipmentsForRole } from '../../../lib/store/selectors';

export default function ShipmentsList() {
  const { t, tf } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user)!;
  const [q, setQ] = useState('');

  const all = shipmentsForRole(user.role, user.supplierId);
  const data = useMemo(
    () =>
      all.filter(
        (s) =>
          !q ||
          s.ref.toLowerCase().includes(q.toLowerCase()) ||
          tf(s, 'destination').toLowerCase().includes(q.toLowerCase()),
      ),
    [all, q, tf],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TX variant="h1" weight="extrabold" style={{ marginBottom: spacing.md }}>
          {t('ship.title')}
        </TX>
        <SearchBar value={q} onChangeText={setQ} placeholder={t('ship.search')} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <FadeIn delay={index * 50}>
            <ShipmentCard shipment={item} onPress={() => router.push(`/(app)/shipments/${item.id}`)} />
          </FadeIn>
        )}
        ListEmptyComponent={
          <EmptyState icon={<Ship size={40} color={colors.textMuted} />} title={t('ship.empty')} desc={t('ship.emptyDesc')} />
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
});
