import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getItems, type SavedItem } from '@/lib/collection';
import { rupiah } from '@/lib/format';
import { colors } from '@/theme';

// Placeholder: the home / collection screen (S9) is built in a later step.
export default function Koleksi() {
  const [items, setItems] = useState<SavedItem[]>([]);
  useEffect(() => {
    getItems().then(setItems);
  }, []);
  return (
    <View style={styles.page}>
      <Text style={styles.text}>Koleksi segera hadir. Isi: {items.length} barang.</Text>
      {items.map((i) => (
        <Text key={i.id} style={styles.small}>
          {i.name}: {rupiah(i.price)} ({i.method})
        </Text>
      ))}
      <Link href="/barang" style={styles.link}>
        Checkout barang lain
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.bg },
  text: { fontSize: 18, color: colors.text },
  small: { fontSize: 14, color: colors.textSoft },
  link: { marginTop: 8, fontSize: 15, color: colors.textSoft, textDecorationLine: 'underline' },
});
