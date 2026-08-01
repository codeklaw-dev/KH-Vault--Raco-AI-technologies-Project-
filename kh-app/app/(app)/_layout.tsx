import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LayoutGrid, Handshake, Ship, Menu, Sparkles } from 'lucide-react-native';
import { colors, spacing, shadow } from '../../lib/theme/tokens';
import { TX } from '../../components/ui';
import { useLocale } from '../../lib/i18n/LocaleProvider';

const TAB_META: Record<string, { icon: any; key: string }> = {
  dashboard: { icon: LayoutGrid, key: 'nav.dashboard' },
  'deals/index': { icon: Handshake, key: 'nav.deals' },
  assistant: { icon: Sparkles, key: 'nav.assistant' },
  'shipments/index': { icon: Ship, key: 'nav.shipments' },
  more: { icon: Menu, key: 'nav.more' },
};

// Center-ordered so the assistant pill is the true middle item for every role.
const ORDER = ['dashboard', 'deals/index', 'assistant', 'shipments/index', 'more'];

function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocale();

  const byName: Record<string, any> = {};
  state.routes.forEach((r: any) => {
    byName[r.name] = r;
  });
  const visible = ORDER.filter((name) => byName[name]).map((name) => byName[name]);
  const ordered = isRTL ? [...visible].reverse() : visible;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom || spacing.sm }]}>
      {ordered.map((route: any) => {
        const meta = TAB_META[route.name];
        const Icon = meta.icon;
        const isActive = state.routes[state.index].name === route.name;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isActive && !event.defaultPrevented) navigation.navigate(route.name as never);
        };

        if (route.name === 'assistant') {
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab} hitSlop={6}>
              <LinearGradient
                colors={[colors.crimson, colors.crimsonDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.aiPill, isActive && styles.aiPillActive]}>
                <Sparkles size={24} color={colors.white} strokeWidth={2.4} />
              </LinearGradient>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab} hitSlop={6}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon size={21} color={isActive ? colors.crimson : colors.textMuted} strokeWidth={isActive ? 2.4 : 2} />
            </View>
            <TX variant="caption" weight={isActive ? 'bold' : 'medium'} color={isActive ? colors.crimson : colors.textMuted} style={{ marginTop: 2 }}>
              {t(meta.key)}
            </TX>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="deals/index" />
      <Tabs.Screen name="deals/[id]" options={{ href: null }} />
      <Tabs.Screen name="assistant" />
      <Tabs.Screen name="shipments/index" />
      <Tabs.Screen name="shipments/[id]" options={{ href: null }} />
      <Tabs.Screen name="suppliers/index" options={{ href: null }} />
      <Tabs.Screen name="suppliers/[id]" options={{ href: null }} />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    ...(Platform.OS === 'web' ? null : shadow.raised),
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  iconWrap: {
    width: 46,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.crimsonTint },
  aiPill: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadow.raised,
  },
  aiPillActive: {
    transform: [{ scale: 1.04 }],
  },
});
