import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ItemPicture } from '@/components/ItemPicture';
import { Page, PrimaryButton } from '@/components/ui';
import { getCheckoutCount, getItems, type SavedItem } from '@/lib/collection';
import { rupiah } from '@/lib/format';
import { FREE_CHECKOUTS } from '@/lib/plan';
import { loadWallet, type Wallet } from '@/lib/profile';
import { colors, maxWidth, radius } from '@/theme';

type Data = { wallet: Wallet; items: SavedItem[]; count: number };

const GAP = 12;

// S9. Home / collection: balance, debt, total saved and the items "bought".
export default function Koleksi() {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const { width } = useWindowDimensions();

  // Reload every time this screen is shown (e.g. after another checkout).
  useFocusEffect(
    useCallback(() => {
      Promise.all([loadWallet(), getItems(), getCheckoutCount()]).then(([wallet, items, count]) =>
        setData(wallet ? { wallet, items, count } : null),
      );
    }, []),
  );

  if (data === null) return <Redirect href="/mulai" />; // onboarding not done yet
  if (!data) return <Page>{null}</Page>;

  const { wallet, items, count } = data;
  const saved = items.reduce((sum, i) => sum + i.price, 0);
  const freeLeft = Math.max(0, FREE_CHECKOUTS - count);
  const cardW = (Math.min(width, maxWidth) - 32 - GAP) / 2;

  return (
    <Page>
      <Text style={styles.brand}>Keranjang Impian</Text>

      <View style={styles.savedCard}>
        <Text style={styles.savedLabel}>Total uang yang kamu selamatkan</Text>
        <Text style={styles.savedAmount}>{rupiah(saved)}</Text>
        <Text style={styles.savedSub}>dari {items.length} barang yang gak jadi kamu beli beneran</Text>
      </View>

      <View style={styles.stats}>
        <Stat label="Saldo bulan ini" value={rupiah(wallet.balance)} color={colors.mint} />
        {wallet.debt > 0 && <Stat label="Sisa hutang" value={rupiah(wallet.debt)} color={colors.butter} />}
      </View>

      <PrimaryButton label="Checkout palsu baru" onPress={() => router.push('/barang')} />
      <Text style={styles.free}>
        {freeLeft > 0
          ? `Checkout gratis: ${freeLeft} dari ${FREE_CHECKOUTS} tersisa`
          : 'Checkout gratis sudah habis'}
      </Text>

      <Text style={styles.section}>Koleksimu</Text>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Belum ada barang. Coba checkout tumbler contoh dulu!</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={[styles.item, { width: cardW }]}>
              <ItemPicture item={item} size={cardW - 16} />
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>{rupiah(item.price)}</Text>
              <Text style={styles.itemDate}>
                {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              {item.hutang > 0 && <Text style={styles.tag}>pakai hutang</Text>}
            </View>
          ))}
        </View>
      )}
    </Page>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: 16, fontWeight: '700', color: colors.pinkDeep, textAlign: 'center' },
  savedCard: {
    marginTop: 16,
    backgroundColor: colors.pink,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
  },
  savedLabel: { fontSize: 15, color: colors.text },
  savedAmount: { marginTop: 4, fontSize: 34, fontWeight: '900', color: colors.text },
  savedSub: { marginTop: 2, fontSize: 13, color: colors.text, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: GAP, marginTop: GAP, marginBottom: 20 },
  stat: { flex: 1, borderRadius: radius.md, padding: 14 },
  statLabel: { fontSize: 13, color: colors.text },
  statValue: { marginTop: 2, fontSize: 18, fontWeight: '800', color: colors.text },
  free: { marginTop: 8, fontSize: 14, color: colors.textSoft, textAlign: 'center' },
  section: { marginTop: 28, marginBottom: 12, fontSize: 20, fontWeight: '800', color: colors.text },
  empty: { backgroundColor: colors.card, borderRadius: radius.md, padding: 20 },
  emptyText: { fontSize: 15, color: colors.textSoft, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  item: { backgroundColor: colors.card, borderRadius: radius.md, padding: 8, gap: 2 },
  itemName: { marginTop: 6, fontSize: 14, fontWeight: '600', color: colors.text },
  itemPrice: { fontSize: 15, fontWeight: '800', color: colors.text },
  itemDate: { fontSize: 12, color: colors.textSoft },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.butter,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
