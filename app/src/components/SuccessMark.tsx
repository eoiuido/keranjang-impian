import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { Icon } from './Icon';

// A pink circle with a check that pops in once: the calm replacement for confetti.
export function SuccessMark({ size = 72 }: { size?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.8)), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [v]);
  return (
    <Animated.View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
      ]}
      accessibilityLabel="Berhasil"
    >
      <Icon name="check" size={size * 0.5} color={colors.white} strokeWidth={2.4} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
