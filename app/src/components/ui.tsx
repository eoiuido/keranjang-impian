import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, type TextStyle, View, type ViewStyle } from 'react-native';
import { colors, maxWidth, radius, type } from '@/theme';
import { Icon, type IconName } from './Icon';

// A phone-width column that scrolls; used by every screen.
export function Page({ children, bg = colors.bg }: { children: ReactNode; bg?: string }) {
  return (
    <ScrollView
      style={{ backgroundColor: bg }}
      contentContainerStyle={[styles.page, { backgroundColor: bg }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.column}>{children}</View>
    </ScrollView>
  );
}

// Back arrow + optional centered title.
export function Header({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Kembali" hitSlop={12} style={styles.iconBtn}>
          <Icon name="back" size={22} />
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
      {!!title && <Text style={styles.headerTitle}>{title}</Text>}
      <View style={[styles.iconBtn, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function Brand() {
  return <Text style={styles.brand}>SPIRIT BELONGINGS</Text>;
}

type ButtonProps = { label: string; onPress?: () => void; disabled?: boolean; busy?: boolean; icon?: IconName };

export function PrimaryButton({ label, onPress, disabled, busy, icon, tone = 'accent' }: ButtonProps & { tone?: 'accent' | 'ink' }) {
  const bg = tone === 'ink' ? colors.ink : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, { backgroundColor: bg }, pressed && styles.pressed, (disabled || busy) && styles.disabled]}
    >
      {busy ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.buttonInner}>
          {icon && <Icon name={icon} size={18} color={colors.white} strokeWidth={2} />}
          <Text style={styles.buttonText}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, icon }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressedLight, disabled && styles.disabled]}
    >
      <View style={styles.buttonInner}>
        {icon && <Icon name={icon} size={18} strokeWidth={2} />}
        <Text style={[styles.buttonText, { color: colors.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function TextButton({ label, onPress, disabled }: { label: string; onPress?: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={styles.textBtn} hitSlop={8}>
      <Text style={styles.textBtnText}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Label on the left, value on the right; rows inside a Card are separated by thin lines.
export function Row({ label, value, strong, first }: { label: string; value: string; strong?: boolean; first?: boolean }) {
  return (
    <View style={[styles.row, !first && styles.rowLine]}>
      <Text style={[styles.rowLabel, strong && styles.rowStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

export function Notice({ tone = 'info', icon, children }: { tone?: 'info' | 'warn' | 'accent'; icon?: IconName; children: ReactNode }) {
  const c = tone === 'warn' ? [colors.warnSoft, colors.warn] : tone === 'accent' ? [colors.accentSoft, colors.accent] : [colors.surface, colors.textSoft];
  return (
    <View style={[styles.notice, { backgroundColor: c[0] }]}>
      {icon && <Icon name={icon} size={18} color={c[1]} />}
      <Text style={[styles.noticeText, tone === 'warn' && { color: colors.warn }]}>{children}</Text>
    </View>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

// Progress bars at the top of onboarding.
export function Steps({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.steps} accessibilityLabel={`Langkah ${current} dari ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.step, i < current && styles.stepOn]} />
      ))}
    </View>
  );
}

export const field = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bg,
  },
}).input;

const styles = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20 },
  column: { width: '100%', maxWidth, flexGrow: 1, paddingTop: 16, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, minHeight: 40 },
  headerTitle: { ...type.h2, fontSize: 16, color: colors.text },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  brand: { ...type.label, fontSize: 12, letterSpacing: 1.6, color: colors.text },
  button: { alignSelf: 'stretch', borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  secondary: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.88 },
  pressedLight: { backgroundColor: colors.surface },
  disabled: { opacity: 0.35 },
  textBtn: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  textBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, backgroundColor: colors.bg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, gap: 12 },
  rowLine: { borderTopWidth: 1, borderTopColor: colors.line },
  rowLabel: { ...type.body, color: colors.textSoft },
  rowValue: { ...type.body, fontWeight: '600', color: colors.text },
  rowStrong: { color: colors.text, fontWeight: '800', fontSize: 16 },
  notice: { flexDirection: 'row', gap: 10, borderRadius: radius.md, padding: 14, alignItems: 'flex-start' },
  noticeText: { ...type.small, fontSize: 14, lineHeight: 20, color: colors.text, flex: 1 },
  label: { ...type.label, color: colors.textSoft, textTransform: 'uppercase' },
  steps: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line },
  stepOn: { backgroundColor: colors.text },
});
