import { Link, Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { cart } from '@/lib/cart';
import { rupiah } from '@/lib/format';
import { colors } from '@/theme';

// Placeholder: the fake checkout (S5-S8) is built in the next step.
export default function Checkout() {
  const item = cart.item;
  if (!item) return <Redirect href="/barang" />;
  return (
    <View style={styles.page}>
      <Text style={styles.text}>Checkout palsu segera hadir.</Text>
      <Text style={styles.text}>
        {item.name}: {rupiah(item.price)}
      </Text>
      <Link href="/barang" style={styles.link}>
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
