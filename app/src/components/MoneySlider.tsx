import { useRef, useState } from 'react';
import { type GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { rupiah } from '@/lib/format';
import { colors, type } from '@/theme';
import { Icon } from './Icon';

type Props = {
  value: number;
  onChange: (v: number) => void;
  sliderMax: number; // right end of the bar
  max: number; // highest value allowed (the + button may go past sliderMax)
  step?: number;
  label: string; // for screen readers
};

// Drag bar for rough amounts, plus − / + buttons for exact Rp100.000 steps.
export function MoneySlider({ value, onChange, sliderMax, max, step = 100_000, label }: Props) {
  const [width, setWidth] = useState(1);
  const left = useRef(0);

  const clamp = (v: number) => Math.min(max, Math.max(0, Math.round(v / step) * step));
  const fromX = (pageX: number) => {
    const ratio = Math.min(1, Math.max(0, (pageX - left.current) / width));
    onChange(clamp(ratio * Math.min(sliderMax, max)));
  };

  const onGrant = (e: GestureResponderEvent) => {
    // The bar is the event target here, so this gives its left edge on the page.
    left.current = e.nativeEvent.pageX - e.nativeEvent.locationX;
    fromX(e.nativeEvent.pageX);
  };

  const end = Math.min(sliderMax, max) || 1;
  const pct = Math.min(1, value / end) * 100;

  return (
    <View>
      <Text style={styles.amount} accessibilityLiveRegion="polite">
        {rupiah(value)}
      </Text>
      <View style={styles.row}>
        <RoundButton sign="−" onPress={() => onChange(clamp(value - step))} disabled={value <= 0} />
        <View
          style={styles.hit}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width || 1)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={onGrant}
          onResponderMove={(e) => fromX(e.nativeEvent.pageX)}
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          aria-valuemin={0}
          aria-valuemax={end}
          aria-valuenow={value}
          aria-valuetext={rupiah(value)}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) =>
            onChange(clamp(value + (e.nativeEvent.actionName === 'increment' ? step : -step)))
          }
        >
          <View style={styles.track} pointerEvents="none">
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <View style={[styles.thumb, { left: `${pct}%` }]} pointerEvents="none" />
        </View>
        <RoundButton sign="+" onPress={() => onChange(clamp(value + step))} disabled={value >= max} />
      </View>
      <View style={styles.ends}>
        <Text style={styles.endText}>Rp0</Text>
        <Text style={styles.endText}>{rupiah(end)}</Text>
      </View>
    </View>
  );
}

function RoundButton({ sign, onPress, disabled }: { sign: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={sign === '+' ? 'Tambah Rp100.000' : 'Kurangi Rp100.000'}
      style={({ pressed }) => [styles.round, pressed && { backgroundColor: colors.surface }, disabled && { opacity: 0.3 }]}
    >
      <Icon name={sign === '+' ? 'plus' : 'minus'} size={20} strokeWidth={2} />
    </Pressable>
  );
}

const THUMB = 26;

const styles = StyleSheet.create({
  amount: { ...type.money, fontSize: 36, lineHeight: 42, color: colors.text, textAlign: 'center', marginBottom: 20 },
  // userSelect: dragging must not highlight the − / + text.
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, userSelect: 'none' },
  // Tall invisible touch area; touchAction stops the page scrolling while dragging.
  hit: { flex: 1, height: 48, justifyContent: 'center', touchAction: 'none', cursor: 'pointer' } as object,
  track: { height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    marginLeft: -THUMB / 2,
    borderRadius: THUMB / 2,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 58 },
  endText: { ...type.small, fontSize: 12, color: colors.textFaint },
});
