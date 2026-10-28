import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSkin } from '@/lib/skin';
import { colors, deco } from '@/theme';
import { Icon } from './Icon';

// Web-only styles (gradients, star shape) that React Native's types don't know.
const web = (s: Record<string, string>) => s as object;

// The success badge pops in once: a gold seal in Butik, a big pink "YAY!" heart in Stiker,
// a plain pink check before a skin is picked.
export function SuccessMark({ size = 72 }: { size?: number }) {
  const skin = useSkin();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.8)), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [v]);
  const pop = { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] };

  if (skin === 'stiker') {
    const s = size * 1.7;
    return (
      <Animated.View style={[styles.heartWrap, { width: s, height: s }, pop]} accessibilityLabel="Berhasil">
        <View style={[styles.heart, StyleSheet.absoluteFill]} />
        <Text style={[styles.sparkle, { top: 0, left: s * 0.02, fontSize: s * 0.16 }]}>✦</Text>
        <Text style={[styles.sparkle, { bottom: s * 0.12, right: 0, fontSize: s * 0.12 }]}>✦</Text>
        <Text style={[styles.yay, { fontSize: s * 0.17, marginTop: -s * 0.08 }]}>YAY!</Text>
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
  heartWrap: { alignItems: 'center', justifyContent: 'center' },
  // A heart drawn as an SVG mask, filled with a pink gradient.
  heart: web({
    backgroundImage: 'linear-gradient(160deg, #FF9ACB 0%, #FF4FA3 60%, #E93A8E 100%)',
    maskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 21s-8.5-5.2-8.5-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 2.8C20.5 15.8 12 21 12 21z'/%3E%3C/svg%3E\")",
    maskSize: '100% 100%',
    WebkitMaskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 21s-8.5-5.2-8.5-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 2.8C20.5 15.8 12 21 12 21z'/%3E%3C/svg%3E\")",
    WebkitMaskSize: '100% 100%',
  }),
  yay: { fontFamily: "'Fredoka', sans-serif", fontWeight: '700', color: '#FFFFFF' },
  sparkle: { position: 'absolute', color: deco.pink },
});
