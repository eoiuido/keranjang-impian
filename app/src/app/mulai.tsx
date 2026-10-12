import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

// Placeholder: onboarding (S2/S3) is built in the next step.
export default function Mulai() {
  return (
    <View style={styles.page}>
      <Text style={styles.text}>Onboarding segera hadir.</Text>
      <Link href="/" style={styles.link}>
        Kembali
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.bg },
  text: { fontSize: 18, color: colors.text },
  link: { fontSize: 15, color: colors.textSoft, textDecorationLine: 'underline' },
});
