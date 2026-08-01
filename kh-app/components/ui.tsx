import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { colors, spacing, radius, type, shadow } from '../lib/theme/tokens';
import { useLocale } from '../lib/i18n/LocaleProvider';

/* ---------------- Text ---------------- */

type TVariant = keyof typeof type;
type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export function TX({
  children,
  variant = 'body',
  weight = 'regular',
  color = colors.textPrimary,
  style,
  numberOfLines,
  align,
}: {
  children: React.ReactNode;
  variant?: TVariant;
  weight?: Weight;
  color?: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
  align?: 'auto' | 'left' | 'right' | 'center';
}) {
  const { f, isRTL } = useLocale();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        type[variant],
        {
          fontFamily: f(weight),
          color,
          textAlign: align ?? (isRTL ? 'right' : 'left'),
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        style as any,
      ]}>
      {children}
    </Text>
  );
}

/* ---------------- Row (RTL aware) ---------------- */

export function Row({
  children,
  style,
  gap,
  align = 'center',
  justify,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
}) {
  const { isRTL } = useLocale();
  return (
    <View
      style={[
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: align,
          justifyContent: justify,
          gap,
        },
        style as any,
      ]}>
      {children}
    </View>
  );
}

/* ---------------- FadeIn ---------------- */

export function FadeIn({
  children,
  delay = 0,
  offset = 12,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  offset?: number;
  style?: ViewStyle | ViewStyle[];
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) },
          ],
        },
        style as any,
      ]}>
      {children}
    </Animated.View>
  );
}

/* ---------------- Pressable with scale ---------------- */

export function Press({
  children,
  onPress,
  style,
  scaleTo = 0.97,
  ...rest
}: Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  scaleTo?: number;
  style?: ViewStyle | ViewStyle[];
}) {
  const s = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.spring(s, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      {...rest}>
      <Animated.View style={[{ transform: [{ scale: s }] }, style as any]}>{children}</Animated.View>
    </Pressable>
  );
}

/* ---------------- Screen ---------------- */

export function Screen({
  children,
  style,
  edges = ['top'],
  bg = colors.bg,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  bg?: string;
}) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: bg }, style as any]}>
      {children}
    </SafeAreaView>
  );
}

/* ---------------- Button ---------------- */

type BtnVariant = 'primary' | 'secondary' | 'dark' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  leftIcon,
  loading,
  disabled,
  full,
  size = 'md',
}: {
  label: string;
  onPress?: () => void;
  variant?: BtnVariant;
  leftIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  size?: 'md' | 'lg';
}) {
  const { f } = useLocale();
  const palettes: Record<BtnVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.crimson, fg: colors.white },
    secondary: { bg: colors.surface, fg: colors.textPrimary, border: colors.borderStrong },
    dark: { bg: colors.ink, fg: colors.white },
    ghost: { bg: 'transparent', fg: colors.crimson },
  };
  const p = palettes[variant];
  const h = size === 'lg' ? 54 : 48;
  return (
    <Press
      onPress={disabled || loading ? undefined : onPress}
      scaleTo={0.98}
      style={[
        styles.btn,
        {
          height: h,
          backgroundColor: p.bg,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
          opacity: disabled ? 0.5 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
          ...(variant !== 'ghost' ? shadow.soft : null),
        },
      ]}>
      <Row gap={8} justify="center">
        {loading ? (
          <ActivityIndicator color={p.fg} size="small" />
        ) : (
          <>
            {leftIcon}
            <Text style={{ fontFamily: f('semibold'), fontSize: 15, color: p.fg }}>{label}</Text>
          </>
        )}
      </Row>
    </Press>
  );
}

/* ---------------- Card ---------------- */

export function Card({
  children,
  onPress,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
}) {
  const inner = (
    <View style={[styles.card, padded && { padding: spacing.lg }, style as any]}>{children}</View>
  );
  if (onPress) {
    return (
      <Press onPress={onPress} scaleTo={0.985}>
        {inner}
      </Press>
    );
  }
  return inner;
}

/* ---------------- StatusPill ---------------- */

export function StatusPill({ fg, bg, label }: { fg: string; bg: string; label: string }) {
  const { f } = useLocale();
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={{ fontFamily: f('semibold'), fontSize: 11.5, color: fg }}>{label}</Text>
    </View>
  );
}

/* ---------------- Avatar ---------------- */

export function Avatar({
  initials,
  size = 44,
  color = colors.crimson,
}: {
  initials: string;
  size?: number;
  color?: string;
}) {
  const { f } = useLocale();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontFamily: f('bold'), color: colors.white, fontSize: size * 0.38 }}>
        {initials}
      </Text>
    </View>
  );
}

/* ---------------- SectionHeader ---------------- */

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { f } = useLocale();
  return (
    <Row justify="space-between" style={{ marginBottom: spacing.md }}>
      <TX variant="h3" weight="bold">
        {title}
      </TX>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ fontFamily: f('semibold'), color: colors.crimson, fontSize: 13 }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Row>
  );
}

/* ---------------- SearchBar ---------------- */

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  const { f, isRTL } = useLocale();
  return (
    <Row
      gap={8}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        height: 46,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
      <Search size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={{
          flex: 1,
          fontFamily: f('regular'),
          fontSize: 14,
          color: colors.textPrimary,
          textAlign: isRTL ? 'right' : 'left',
        }}
      />
    </Row>
  );
}

/* ---------------- ProgressBar ---------------- */

export function ProgressBar({ pct, color = colors.crimson }: { pct: number; color?: string }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, {
      toValue: pct,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, w]);
  return (
    <View style={styles.track}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: color,
          width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

/* ---------------- KpiStat ---------------- */

export function KpiStat({
  label,
  value,
  sub,
  icon,
  accent = colors.crimson,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  accent?: string;
}) {
  const { f, isRTL } = useLocale();
  return (
    <View style={[styles.card, { padding: spacing.lg, flex: 1 }]}>
      <Row justify="space-between" align="flex-start">
        <View style={[styles.kpiIcon, { backgroundColor: accent + '18' }]}>{icon}</View>
      </Row>
      <Text
        style={{
          fontFamily: f('extrabold'),
          fontSize: 24,
          color: colors.textPrimary,
          marginTop: spacing.md,
          textAlign: isRTL ? 'right' : 'left',
          fontVariant: ['tabular-nums'],
        }}>
        {value}
      </Text>
      <Text
        style={{
          fontFamily: f('medium'),
          fontSize: 12.5,
          color: colors.textSecondary,
          marginTop: 2,
          textAlign: isRTL ? 'right' : 'left',
        }}>
        {label}
      </Text>
      {sub ? (
        <Text
          style={{
            fontFamily: f('semibold'),
            fontSize: 11,
            color: accent,
            marginTop: 4,
            textAlign: isRTL ? 'right' : 'left',
          }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------------- EmptyState ---------------- */

export function EmptyState({
  icon,
  title,
  desc,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
}) {
  return (
    <View style={styles.empty}>
      {icon ? <View style={{ marginBottom: spacing.md }}>{icon}</View> : null}
      <TX variant="h3" weight="bold" align="center">
        {title}
      </TX>
      {desc ? (
        <TX variant="bodySm" color={colors.textSecondary} align="center" style={{ marginTop: 6 }}>
          {desc}
        </TX>
      ) : null}
    </View>
  );
}

/* ---------------- Divider ---------------- */

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  track: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  kpiIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
});
