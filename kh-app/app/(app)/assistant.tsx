import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Sparkles, ArrowUp, Check, X, RotateCcw } from 'lucide-react-native';
import { colors, spacing, radius, shadow } from '../../lib/theme/tokens';
import { TX, Row, Press } from '../../components/ui';
import { useLocale } from '../../lib/i18n/LocaleProvider';
import { useAuth } from '../../lib/store/useAuth';
import { useAssistant, ChatTurn } from '../../lib/store/useAssistant';
import { useOps } from '../../lib/store/useOps';
import type { AiAction, AiContext } from '../../lib/ai/types';

const INVITE_LINK = 'https://khtimber.app/onboard/INV-8F3K';

function copyText(text: string) {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

/* ---------------- typing dots ---------------- */

function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 380, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);
  return (
    <View style={[styles.bubble, styles.bubbleAi]}>
      <Row gap={5}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: colors.textMuted,
              opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
            }}
          />
        ))}
      </Row>
    </View>
  );
}

/* ---------------- action button (confirm guard) ---------------- */

function ActionButton({ action }: { action: AiAction }) {
  const { lang, t } = useLocale();
  const router = useRouter();
  const approveDeal = useOps((s) => s.approveDeal);
  const setShipmentStatus = useOps((s) => s.setShipmentStatus);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const stateful = action.kind === 'approve_deal' || action.kind === 'update_shipment';
  const label = lang === 'ar' ? action.labelAr : action.label;

  const execute = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    switch (action.kind) {
      case 'approve_deal':
        approveDeal(action.payload);
        setDone(true);
        break;
      case 'update_shipment':
        setShipmentStatus(action.payload, 'in_transit');
        setDone(true);
        break;
      case 'open_deal':
        router.push(`/(app)/deals/${action.payload}`);
        break;
      case 'open_shipment':
        router.push(`/(app)/shipments/${action.payload}`);
        break;
      case 'open_supplier':
        router.push(`/(app)/suppliers/${action.payload}`);
        break;
      case 'copy_invite':
        copyText(INVITE_LINK);
        setDone(true);
        break;
      case 'draft':
        copyText(action.payload);
        setDone(true);
        break;
    }
    setPending(false);
  };

  if (done) {
    const doneLabel =
      action.kind === 'approve_deal'
        ? t('assistant.approved')
        : action.kind === 'draft' || action.kind === 'copy_invite'
          ? t('assistant.copied')
          : t('assistant.done');
    return (
      <View style={[styles.action, styles.actionDone]}>
        <Row gap={6}>
          <Check size={15} color={colors.success} strokeWidth={2.6} />
          <TX variant="bodySm" weight="semibold" color={colors.success}>
            {doneLabel}
          </TX>
        </Row>
      </View>
    );
  }

  if (stateful && pending) {
    return (
      <Row gap={8}>
        <Press
          onPress={execute}
          scaleTo={0.96}
          style={[styles.action, { backgroundColor: colors.crimson, ...shadow.soft }]}>
          <Row gap={6}>
            <Check size={15} color={colors.white} strokeWidth={2.6} />
            <TX variant="bodySm" weight="bold" color={colors.white}>
              {t('assistant.confirm')}
            </TX>
          </Row>
        </Press>
        <Pressable onPress={() => setPending(false)} hitSlop={8} style={[styles.action, styles.actionGhost]}>
          <X size={15} color={colors.textMuted} strokeWidth={2.4} />
        </Pressable>
      </Row>
    );
  }

  const primary = stateful;
  return (
    <Press
      onPress={() => {
        if (stateful) {
          Haptics.selectionAsync().catch(() => {});
          setPending(true);
        } else {
          execute();
        }
      }}
      scaleTo={0.96}
      style={[
        styles.action,
        primary
          ? { backgroundColor: colors.crimson, ...shadow.soft }
          : styles.actionGhost,
      ]}>
      <TX variant="bodySm" weight={primary ? 'bold' : 'semibold'} color={primary ? colors.white : colors.textPrimary}>
        {label}
      </TX>
    </Press>
  );
}

/* ---------------- message bubble ---------------- */

function MessageBubble({ turn }: { turn: ChatTurn }) {
  const { isRTL } = useLocale();
  const router = useRouter();
  const isUser = turn.role === 'user';
  return (
    <View style={{ width: '100%', alignItems: isUser ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start') }}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
        <TX
          variant="body"
          color={isUser ? colors.white : colors.textPrimary}
          align={isRTL ? 'right' : 'left'}>
          {turn.text}
        </TX>
      </View>
      {turn.actions && turn.actions.length > 0 ? (
        <View style={[styles.actionWrap, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          {turn.actions.map((a, i) => (
            <ActionButton key={`${a.kind}-${a.payload}-${i}`} action={a} />
          ))}
        </View>
      ) : null}
      {turn.refs && turn.refs.length > 0 ? (
        <Row gap={8} style={[styles.actionWrap, { flexWrap: 'wrap' }]}>
          {turn.refs.map((r, i) => (
            <Press
              key={`${r.payload}-${i}`}
              onPress={() =>
                router.push(
                  r.kind === 'open_shipment'
                    ? `/(app)/shipments/${r.payload}`
                    : `/(app)/deals/${r.payload}`,
                )
              }
              scaleTo={0.95}
              style={[styles.action, styles.actionGhost]}>
              <TX variant="bodySm" weight="semibold" color={colors.crimson}>
                {r.label}
              </TX>
            </Press>
          ))}
        </Row>
      ) : null}
    </View>
  );
}

/* ---------------- prompt chips ---------------- */

function PromptChips({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useLocale();
  const role = useAuth((s) => s.user?.role);
  const keys =
    role === 'supplier'
      ? ['assistant.chip.myShipment', 'assistant.chip.brief', 'assistant.chip.draftUpdate', 'assistant.chip.myDeals']
      : ['assistant.chip.approvals', 'assistant.chip.brief', 'assistant.chip.shouldApprove', 'assistant.chip.findSupplier', 'assistant.chip.draftDelay'];
  return (
    <View style={{ gap: spacing.sm }}>
      {keys.map((k) => (
        <Press key={k} onPress={() => onPick(t(k))} scaleTo={0.98} style={styles.chip}>
          <Row gap={8}>
            <Sparkles size={15} color={colors.crimson} strokeWidth={2.2} />
            <TX variant="bodySm" weight="medium" color={colors.textPrimary} style={{ flex: 1 }}>
              {t(k)}
            </TX>
          </Row>
        </Press>
      ))}
    </View>
  );
}

/* ---------------- screen ---------------- */

export default function AssistantScreen() {
  const { t, f, lang, isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const messages = useAssistant((s) => s.messages);
  const busy = useAssistant((s) => s.busy);
  const send = useAssistant((s) => s.send);
  const reset = useAssistant((s) => s.reset);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const ctx: AiContext = { role: user?.role ?? 'owner', lang, supplierId: user?.supplierId };

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(id);
  }, [messages.length, busy]);

  const submit = (text: string) => {
    const v = text.trim();
    if (!v || busy) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    send(v, ctx);
  };

  const empty = messages.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Row justify="space-between">
          <Row gap={10}>
            <LinearGradient
              colors={[colors.crimson, colors.crimsonDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIcon}>
              <Sparkles size={20} color={colors.white} strokeWidth={2.4} />
            </LinearGradient>
            <View>
              <TX variant="h2" weight="extrabold">
                {t('assistant.title')}
              </TX>
              <TX variant="caption" color={colors.textSecondary}>
                {t('assistant.tagline')}
              </TX>
            </View>
          </Row>
          {!empty ? (
            <Pressable onPress={() => reset()} hitSlop={8} style={styles.resetBtn}>
              <RotateCcw size={18} color={colors.textSecondary} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </Row>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {empty ? (
            <View style={{ gap: spacing.lg, marginTop: spacing.sm }}>
              <View>
                <TX variant="h3" weight="bold">
                  {t('assistant.emptyTitle')}
                </TX>
                <TX variant="bodySm" color={colors.textSecondary} style={{ marginTop: 4 }}>
                  {t('assistant.emptyDesc')}
                </TX>
              </View>
              <PromptChips onPick={submit} />
            </View>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} turn={m} />)
          )}
          {busy ? <TypingDots /> : null}
        </ScrollView>

        {/* input bar */}
        <View style={[styles.inputBar, { paddingBottom: (insets.bottom || spacing.sm) + spacing.sm }]}>
          <Row gap={8} style={{ alignItems: 'flex-end' }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('assistant.inputPlaceholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              onSubmitEditing={() => submit(input)}
              style={[styles.input, { textAlign: isRTL ? 'right' : 'left', fontFamily: f('regular') }]}
            />
            <Press
              onPress={() => submit(input)}
              scaleTo={0.92}
              style={[styles.sendBtn, { opacity: input.trim() && !busy ? 1 : 0.4 }]}>
              <ArrowUp size={20} color={colors.white} strokeWidth={2.6} />
            </Press>
          </Row>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  resetBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  bubble: {
    maxWidth: '86%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.crimson,
    borderBottomRightRadius: radius.sm,
  },
  bubbleAi: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
    ...shadow.soft,
  },
  actionWrap: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  action: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  actionGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  actionDone: {
    backgroundColor: colors.successTint,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.soft,
  },
  inputBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
});
