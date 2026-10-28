import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSkin } from '@/lib/skin';
import { colors, deco } from '@/theme';
import { Icon } from './Icon';

// Web-only styles (gradients, star shape) that React Native's types don't know.
const web = (s: Record<string, string>) => s as object;

// The success badge pops in once: a gold seal in Butik, a "YES!" burst in Stiker,
// a plain pink check before a skin is picked.
export function SuccessMark({ size = 72 }: { size?: number }) {
  const skin = useSkin();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.8)), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [v]);
  const pop = { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] };

  if (skin === 'stiker') {
    const s = size * 1.6;
    return (
      <Animated.View style={[styles.burst, { width: s, height: s }, pop]} accessibilityLabel="Berhasil">
        <Text style={[styles.yes, { fontSize: s * 0.18 }]}>YES!</Text>
      </Animated.View>
    );
  }
  if (skin === 'butik') {
    const s = size * 1.25;
    return (
      <Animated.View style={[styles.seal, { width: s, height: s, borderRadius: s / 2 }, pop]} accessibilityLabel="Berhasil">
        <View style={[styles.gold, { borderRadius: s / 2 }]}>
          <Icon name="check" size={s * 0.4} color={deco.plum} strokeWidth={2} />
        </View>
      </Animated.View>
    );
  }
  return (
    <Animated.View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, pop]} accessibilityLabel="Berhasil">
      <Icon name="check" size={size * 0.5} color={colors.white} strokeWidth={2.4} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  seal: { borderWidth: 1, borderColor: deco.gold, padding: 6 },
  gold: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...web({ backgroundImage: 'linear-gradient(135deg, #8C6A3B, #E9D3A4 40%, #B48A4E 60%, #F4E4C1)' }),
  },
  burst: {
    backgroundColor: deco.lime,
    alignItems: 'center',
    justifyContent: 'center',
    ...web({ clipPath: 'polygon(50% 0,61% 32%,95% 20%,72% 48%,100% 70%,64% 68%,58% 100%,44% 70%,10% 86%,30% 56%,0 30%,36% 34%)' }),
  },
  yes: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: '800', color: deco.ink },
});
