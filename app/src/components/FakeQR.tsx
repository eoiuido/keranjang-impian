import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

const N = 21; // cells per side, like a small QR code

// A QR-looking pattern that encodes nothing, stamped PALSU. No real app can pay it.
function cells(): boolean[][] {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const finder = (r: number, c: number) => {
    for (const [fr, fc] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
      const y = r - fr;
      const x = c - fc;
      if (y >= 0 && y < 7 && x >= 0 && x < 7) {
        const edge = y === 0 || y === 6 || x === 0 || x === 6;
        const core = y >= 2 && y <= 4 && x >= 2 && x <= 4;
        return edge || core;
      }
      if (y >= -1 && y <= 7 && x >= -1 && x <= 7) return false; // white border
    }
    return null;
  };
  return Array.from({ length: N }, (_, r) =>
    Array.from({ length: N }, (_, c) => finder(r, c) ?? rand() > 0.55),
  );
}

const GRID = cells();

export const FakeQR = memo(function FakeQR({ size }: { size: number }) {
  const cell = size / N;
  return (
    <View style={[styles.box, { width: size + 24, height: size + 24 }]} accessibilityLabel="QR palsu">
      {GRID.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((on, c) => (
            <View key={c} style={{ width: cell, height: cell, backgroundColor: on ? colors.text : 'transparent' }} />
          ))}
        </View>
      ))}
      <View style={styles.stamp} pointerEvents="none">
        <Text style={styles.stampText}>PALSU</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  box: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stamp: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: colors.pinkDeep,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,248,251,0.9)',
    transform: [{ rotate: '-14deg' }],
  },
  stampText: { fontSize: 34, fontWeight: '900', color: colors.pinkDeep, letterSpacing: 4 },
});
