import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors } from '@/theme';

const COUNT = 36;
const PALETTE = [colors.pink, colors.pinkDeep, colors.lavender, colors.mint, colors.butter];

// Pastel pieces falling once from the top of the screen.
export function Confetti() {
  const { width, height } = useWindowDimensions();
  const fall = useRef(new Animated.Value(0)).current;
  const pieces = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: Math.random(),
        delay: Math.random() * 0.3,
        spin: (Math.random() - 0.5) * 720,
        size: 8 + Math.random() * 8,
        color: PALETTE[i % PALETTE.length],
        round: i % 3 === 0,
      })),
    [],
  );

  useEffect(() => {
    Animated.timing(fall, {
      toValue: 1,
      duration: 2200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fall]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x * width,
            top: -20,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            borderRadius: p.round ? p.size : 2,
            backgroundColor: p.color,
            opacity: fall.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [
              {
                translateY: fall.interpolate({
                  inputRange: [0, p.delay, 1],
                  outputRange: [0, 0, height * (0.6 + p.x * 0.3)],
                }),
              },
              { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}
