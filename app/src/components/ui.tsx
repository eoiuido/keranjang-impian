import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, maxWidth, radius } from '@/theme';

// A phone-width column that scrolls; used by every screen.
export function Page({ children }: { children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.column}>{children}</View>
    </ScrollView>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

// "1 dari 2" step dots at the top of onboarding.
export function Steps({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.steps} accessibilityLabel={`Langkah ${current} dari ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i < current && styles.dotOn]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', backgroundColor: colors.bg, paddingHorizontal: 16 },
  column: { width: '100%', maxWidth, flexGrow: 1, paddingTop: 20, paddingBottom: 24 },
  button: {
    alignSelf: 'stretch',
    backgroundColor: colors.button,
    borderRadius: radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  buttonText: { color: colors.buttonText, fontSize: 18, fontWeight: '700' },
  steps: { flexDirection: 'row', gap: 6, alignSelf: 'center' },
  dot: { width: 28, height: 6, borderRadius: 3, backgroundColor: colors.pink },
  dotOn: { backgroundColor: colors.pinkDeep },
});
