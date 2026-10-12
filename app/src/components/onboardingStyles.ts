import { StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

// Shared look of the two onboarding screens.
export const onboarding = StyleSheet.create({
  title: { marginTop: 28, fontSize: 28, lineHeight: 34, fontWeight: '800', color: colors.text },
  sub: { marginTop: 6, fontSize: 16, color: colors.textSoft },
  why: { marginTop: 20, backgroundColor: colors.butter, borderRadius: radius.md, padding: 16 },
  whyText: { fontSize: 15, lineHeight: 22, color: colors.text },
  slider: { marginTop: 36 },
  bottom: { marginTop: 'auto', paddingTop: 32, gap: 10 },
  privacy: { fontSize: 13, color: colors.textSoft, textAlign: 'center' },
});
