import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Confetti } from '@/components/Confetti';
import { ItemPicture } from '@/components/ItemPicture';
import { Page, PrimaryButton } from '@/components/ui';
import { last } from '@/lib/collection';
import { rupiah } from '@/lib/format';
import { withInterest } from '@/lib/money';
import { colors, radius } from '@/theme';

// S8. Success: the "aha" moment.
export default function Berhasil() {
  const result = last.result;
  if (!result) return <Redirect href="/koleksi" />;
  const { item, before, after, debt } = result;

  return (
    <View style={{ flex: 1 }}>
      <Page>
        <View style={styles.top}>
          <Text style={styles.done}>Pembayaran berhasil · Rp0</Text>
          <ItemPicture item={item} size={160} />
          <Text style={styles.big}>Kamu baru saja menyelamatkan</Text>
          <Text style={styles.amount}>{rupiah(item.price)}</Text>
          <Text style={styles.sub}>{item.name} masuk ke koleksimu. Uang aslimu tetap aman.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Saldo impian</Text>
          <Text style={styles.cardValue}>
            {rupiah(before)} → {rupiah(after)}
          </Text>
          {item.hutang > 0 && (
            <Text style={styles.debt}>
              Hutang baru {rupiah(item.hutang)} · Total hutang {rupiah(debt)}
              {'\n'}Bulan depan dipotong {rupiah(withInterest(debt))}
            </Text>
          )}
        </View>

        <View style={styles.bottom}>
          <PrimaryButton label="Lihat koleksi" onPress={() => router.replace('/koleksi')} />
          <Pressable onPress={() => router.replace('/barang')} accessibilityRole="button" style={styles.again}>
            <Text style={styles.againText}>Checkout barang lain</Text>
          </Pressable>
        </View>
      </Page>
      <Confetti />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', paddingTop: 12 },
  done: {
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.mint,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  big: { marginTop: 24, fontSize: 20, fontWeight: '600', color: colors.text, textAlign: 'center' },
  amount: { marginTop: 4, fontSize: 40, fontWeight: '900', color: colors.pinkDeep },
  sub: { marginTop: 8, fontSize: 16, lineHeight: 22, color: colors.textSoft, textAlign: 'center' },
  card: { marginTop: 24, backgroundColor: colors.card, borderRadius: radius.md, padding: 16, alignItems: 'center' },
  cardLabel: { fontSize: 14, color: colors.textSoft },
  debt: { marginTop: 8, fontSize: 14, lineHeight: 20, color: colors.pinkDeep, textAlign: 'center', fontWeight: '600' },
  cardValue: { marginTop: 4, fontSize: 20, fontWeight: '800', color: colors.text },
  bottom: { marginTop: 'auto', paddingTop: 24, gap: 6 },
  again: { alignSelf: 'center', padding: 12 },
  againText: { fontSize: 16, fontWeight: '600', color: colors.text, textDecorationLine: 'underline' },
});
