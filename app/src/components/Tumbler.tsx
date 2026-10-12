import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

// Our own pastel tumbler drawing (no real brand), built from plain shapes.
export function Tumbler({ size = 1 }: { size?: number }) {
  const s = (n: number) => n * size;
  return (
    <View style={{ width: s(150), height: s(200), alignItems: 'center' }} accessibilityLabel="Tumbler pastel">
      <View style={[styles.straw, { width: s(8), height: s(46), left: s(86), borderRadius: s(4) }]} />
      <View style={[styles.lid, { width: s(96), height: s(22), marginTop: s(30), borderRadius: s(10) }]} />
      <View
        style={[
          styles.body,
          {
            width: s(88),
            height: s(140),
            borderBottomLeftRadius: s(22),
            borderBottomRightRadius: s(22),
            borderTopLeftRadius: s(6),
            borderTopRightRadius: s(6),
          },
        ]}
      >
        <View style={[styles.band, { height: s(18), marginTop: s(46) }]} />
        <View style={[styles.heart, { width: s(18), height: s(18), marginTop: s(16), borderRadius: s(9) }]} />
      </View>
      <View
        style={[
          styles.handle,
          { width: s(34), height: s(72), top: s(70), right: s(10), borderWidth: s(9), borderRadius: s(18) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  straw: { position: 'absolute', top: 0, backgroundColor: colors.lavender, transform: [{ rotate: '12deg' }] },
  lid: { backgroundColor: colors.lavender, zIndex: 2 },
  body: { backgroundColor: colors.pink, alignItems: 'center', overflow: 'hidden', zIndex: 2 },
  band: { alignSelf: 'stretch', backgroundColor: colors.mint },
  heart: { backgroundColor: colors.pinkDeep },
  handle: { position: 'absolute', borderColor: colors.pinkDeep, borderLeftWidth: 0, zIndex: 1 },
});
