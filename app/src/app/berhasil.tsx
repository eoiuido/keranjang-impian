import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ItemPicture } from '@/components/ItemPicture';
import { SuccessMark } from '@/components/SuccessMark';
import { Card, Page, PrimaryButton, Row, TextButton, Display } from '@/components/ui';
import { last } from '@/lib/collection';
import { rupiah } from '@/lib/format';
import { withInterest } from '@/lib/money';
import { useSkin } from '@/lib/skin';
import { colors, type } from '@/theme';

// S8. Success: the "aha" moment.
export default function Berhasil() {
  const skin = useSkin();
  const result = last.result;
  if (!result) return <Redirect href="/koleksi" />;
  const { item, before, after, debt } = result;

  return (
    <Page>
      <View style={styles.top}>
        <SuccessMark />
        <Text style={styles.done}>Pembayaran berhasil · Rp0</Text>
        <Text style={styles.big}>Kamu baru saja menyelamatkan</Text>
        <Display kind="money" style={styles.amount}>{rupiah(item.price)}</Display>
        <Text style={styles.sub}>{skin === 'stiker' ? 'Uang aslimu tetap aman ♡' : 'Uang aslimu tetap aman.'}</Text>
      </View>

      <Card style={styles.itemCard}>
        <ItemPicture item={item} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemNote}>Masuk ke koleksimu</Text>
        </View>
      </Card>

      <Card style={{ marginTop: 12, paddingVertical: 6 }}>
        <Row first label="Saldo sebelum" value={rupiah(before)} />
        <Row label="Saldo sekarang" value={rupiah(after)} strong />
        {item.hutang > 0 && (
          <>
            <Row label="Hutang baru" value={rupiah(item.hutang)} />
            <Row label="Dipotong bulan depan" value={rupiah(withInterest(debt))} />
          </>
        )}
      </Card>

      <View style={styles.bottom}>
        <PrimaryButton label="Lihat koleksi" onPress={() => router.replace('/koleksi')} />
        <TextButton label="Checkout barang lain" onPress={() => router.replace('/barang')} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', paddingTop: 28 },
  done: { ...type.label, marginTop: 18, color: colors.textSoft, textTransform: 'uppercase' },
  big: { ...type.body, fontSize: 17, marginTop: 14, color: colors.text, textAlign: 'center' },
  amount: { ...type.money, fontSize: 42, lineHeight: 50, marginTop: 2, color: colors.accent },
  sub: { ...type.body, marginTop: 4, color: colors.textSoft, textAlign: 'center' },
  itemCard: { marginTop: 28, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 },
  itemName: { ...type.body, fontWeight: '700', color: colors.text },
  itemNote: { ...type.small, color: colors.textSoft },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 4 },
});
