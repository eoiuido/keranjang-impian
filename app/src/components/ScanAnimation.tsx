import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import { FakeQR } from './FakeQR';

const native = Platform.OS !== 'web';
const FRAME = 240;

// Fake camera view: a scan line sweeps over the QR. The real camera is never used.
export function ScanAnimation({ processing }: { processing: boolean }) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
        Animated.timing(y, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y]);

  return (
    <View style={styles.overlay}>
      <View style={styles.frame}>
        <FakeQR size={FRAME - 60} />
        {(['tl', 'tr', 'bl', 'br'] as const).map((k) => (
          <View key={k} style={[styles.corner, styles[k]]} />
        ))}
        <Animated.View
          style={[styles.line, { transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [8, FRAME - 12] }) }] }]}
        />
      </View>
      {processing ? (
        <View style={styles.status}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.text}>Memproses pembayaran…</Text>
        </View>
      ) : (
        <Text style={[styles.text, styles.status]}>Arahkan ke kode QR…</Text>
      )}
    </View>
  );
}

const C = 34;
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,17,20,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  frame: { width: FRAME, height: FRAME, alignItems: 'center', justifyContent: 'center', opacity: 0.9 },
  corner: { position: 'absolute', width: C, height: C, borderColor: '#FFFFFF' },
  tl: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 12 },
  tr: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 12 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 12 },
  br: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 12 },
  line: { position: 'absolute', top: 0, left: 10, right: 10, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  status: { marginTop: 28, flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { color: '#FFFFFF', fontSize: 17 },
});
