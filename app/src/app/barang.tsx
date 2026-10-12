import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { rupiah } from '@/lib/format';
import { getWallet } from '@/lib/profile';
import { colors } from '@/theme';

// Placeholder: the dream item screen (S4) is built in the next step.
export default function Barang() {
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    getWallet().then((w) => setBalance(w?.balance ?? null));
  }, []);

  return (
    <View style={styles.page}>
      <Text style={styles.text}>Barang impian segera hadir.</Text>
      {balance !== null && <Text style={styles.text}>Saldo kamu: {rupiah(balance)}</Text>}
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
