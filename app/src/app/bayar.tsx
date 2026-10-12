import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { rupiah } from '@/lib/format';
import { PLANS } from '@/lib/plan';
import { colors } from '@/theme';

// Placeholder: email (S11) and real DOKU QRIS payment (S12) are built with the server.
export default function Bayar() {
  const { plan, offer } = useLocalSearchParams<{ plan?: string; offer?: string }>();
  const p = plan === 'weekly' ? PLANS.weekly : PLANS.yearly;
  const price = plan !== 'weekly' && offer === '1' ? PLANS.yearly.offerPrice : p.price;
  return (
    <View style={styles.page}>
      <Text style={styles.text}>Pembayaran asli segera hadir.</Text>
      <Text style={styles.text}>
        {p.name}: {rupiah(price)} / {p.period}
      </Text>
      <Link href="/koleksi" style={styles.link}>
        Kembali ke koleksi
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.bg },
  text: { fontSize: 18, color: colors.text },
  link: { fontSize: 15, color: colors.textSoft, textDecorationLine: 'underline' },
});
