import { StyleSheet } from 'react-native';
import { colors, type } from '@/theme';

// Shared look of the two onboarding screens.
export const onboarding = StyleSheet.create({
  title: { ...type.title, marginTop: 24, color: colors.text },
  sub: { ...type.body, marginTop: 6, color: colors.textSoft },
  slider: { marginTop: 36 },
  bottom: { marginTop: 'auto', paddingTop: 32, gap: 10 },
  privacy: { ...type.small, color: colors.textSoft, textAlign: 'center' },
});
