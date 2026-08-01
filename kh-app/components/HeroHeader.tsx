import React from 'react';
import { View, Pressable, StyleSheet, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, spacing } from '../lib/theme/tokens';
import { TX, Row } from './ui';
import { useLocale } from '../lib/i18n/LocaleProvider';

export function HeroHeader({
  image,
  title,
  subtitle,
  height = 240,
  onBack,
  right,
  badge,
}: {
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
  height?: number;
  onBack?: () => void;
  right?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { isRTL } = useLocale();
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <View style={{ height: height + insets.top }}>
      <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      <LinearGradient
        colors={['rgba(20,17,15,0.45)', 'rgba(20,17,15,0.15)', 'rgba(20,17,15,0.85)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* top bar */}
      <Row
        justify="space-between"
        style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg }}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
            <BackIcon size={22} color={colors.white} />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
        {right ?? <View style={{ width: 38 }} />}
      </Row>
      {/* bottom content */}
      <View style={{ flex: 1, justifyContent: 'flex-end', padding: spacing.xl }}>
        {badge ? <View style={{ marginBottom: spacing.sm }}>{badge}</View> : null}
        <TX variant="h1" weight="extrabold" color={colors.white} numberOfLines={2}>
          {title}
        </TX>
        {subtitle ? (
          <TX variant="body" color="rgba(255,255,255,0.85)" weight="medium" style={{ marginTop: 4 }}>
            {subtitle}
          </TX>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
