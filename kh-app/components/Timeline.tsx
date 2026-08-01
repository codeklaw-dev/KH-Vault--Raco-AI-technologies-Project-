import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing } from '../lib/theme/tokens';
import { TX, Row } from './ui';
import { useLocale } from '../lib/i18n/LocaleProvider';

export interface TimelineItem {
  title: string;
  subtitle?: string;
  meta?: string;
  done: boolean;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  const { isRTL } = useLocale();
  const currentIndex = items.findIndex((i) => !i.done);

  return (
    <View>
      {items.map((item, i) => {
        const isCurrent = i === currentIndex;
        const isLast = i === items.length - 1;
        const lineColor = item.done ? colors.crimson : colors.border;
        const nodeColor = item.done
          ? colors.crimson
          : isCurrent
            ? colors.white
            : colors.surfaceAlt;
        const nodeBorder = isCurrent ? colors.crimson : item.done ? colors.crimson : colors.borderStrong;

        return (
          <Row key={i} align="flex-start" style={{ minHeight: isLast ? undefined : 56 }}>
            {/* rail */}
            <View style={{ alignItems: 'center', width: 24 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: nodeColor,
                  borderWidth: 2,
                  borderColor: nodeBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {item.done ? <Check size={12} color={colors.white} strokeWidth={3} /> : null}
                {isCurrent && !item.done ? (
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.crimson }} />
                ) : null}
              </View>
              {!isLast ? (
                <View style={{ width: 2, flex: 1, minHeight: 30, backgroundColor: lineColor, marginTop: 2 }} />
              ) : null}
            </View>
            {/* content */}
            <View style={{ flex: 1, paddingBottom: isLast ? 0 : spacing.lg, [isRTL ? 'marginRight' : 'marginLeft']: spacing.md }}>
              <TX weight={item.done || isCurrent ? 'semibold' : 'medium'} color={item.done || isCurrent ? colors.textPrimary : colors.textMuted}>
                {item.title}
              </TX>
              {item.subtitle ? (
                <TX variant="bodySm" color={colors.textSecondary} style={{ marginTop: 1 }}>
                  {item.subtitle}
                </TX>
              ) : null}
              {item.meta ? (
                <TX variant="caption" color={isCurrent ? colors.crimson : colors.textMuted} weight={isCurrent ? 'semibold' : 'regular'} style={{ marginTop: 3 }}>
                  {item.meta}
                </TX>
              ) : null}
            </View>
          </Row>
        );
      })}
    </View>
  );
}
