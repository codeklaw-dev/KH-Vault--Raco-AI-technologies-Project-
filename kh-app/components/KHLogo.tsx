import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../lib/theme/tokens';

interface Props {
  size?: number;
  variant?: 'crimson' | 'outline' | 'plain';
}

/**
 * KH Timber monogram. A bracketed square frame with the "KH" wordmark,
 * echoing the brand's interlocked-letter logo.
 */
export function KHLogo({ size = 44, variant = 'crimson' }: Props) {
  const isCrimson = variant === 'crimson';
  const frame = isCrimson ? colors.white : colors.crimson;
  const text = isCrimson ? colors.white : colors.crimson;
  const bg = isCrimson ? colors.crimson : 'transparent';
  const bracket = Math.max(2, size * 0.07);
  const armLen = size * 0.28;
  const inset = size * 0.12;

  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderRadius: size * 0.18,
        },
      ]}>
      {/* top-left bracket */}
      <View style={[styles.corner, { top: inset, left: inset }]}>
        <View style={{ width: armLen, height: bracket, backgroundColor: frame }} />
        <View style={{ width: bracket, height: armLen, backgroundColor: frame }} />
      </View>
      {/* bottom-right bracket */}
      <View style={[styles.cornerBR, { bottom: inset, right: inset }]}>
        <View style={{ width: bracket, height: armLen, backgroundColor: frame, alignSelf: 'flex-end' }} />
        <View style={{ width: armLen, height: bracket, backgroundColor: frame }} />
      </View>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: fonts.extrabold,
          color: text,
          fontSize: size * 0.4,
          letterSpacing: -size * 0.01,
        }}>
        KH
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
  },
  cornerBR: {
    position: 'absolute',
    alignItems: 'flex-end',
  },
});
