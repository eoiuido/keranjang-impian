import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { ItemPicture } from '@/components/ItemPicture';
import { Brand, Card, Page, PrimaryButton, Row } from '@/components/ui';
import { syncBackupIfDirty } from '@/lib/backup';
import { getCheckoutCount, getItems, type SavedItem } from '@/lib/collection';
import { rupiah } from '@/lib/format';
import { type Access, FREE_CHECKOUTS, getAccess, getPendingOrder, type PendingOrder, PLANS } from '@/lib/plan';
import { loadWallet, type Wallet } from '@/lib/profile';
import { colors, maxWidth, radius, type } from '@/theme';

type Data = { wallet: Wallet; items: SavedItem[]; count: number; pending: PendingOrder | null; access: Access | null };

const GAP = 12;
const PAD = 20; // Page side padding
const shortDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// S9. Home / collection: total saved, balance, debt and the items "bought".
export default function Koleksi() {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const { width } = useWindowDimensions();

  // Reload every time this screen is shown (e.g. after another checkout).
  useFocusEffect(
    useCallback(() => {
      syncBackupIfDirty(); // retry an upload that failed while offline
      Promise.all([loadWallet(), getItems(), getCheckoutCount(), getPendingOrder(), getAccess()]).then(
        ([wallet, items, count, pending, access]) =>
          setData(wallet ? { wallet, items, count, pending: pending ?? null, access: access ?? null } : null),
      );
    }, []),
  );

  if (data === null) return <Redirect href="/mulai" />; // onboarding not done yet
  if (!data) return <Page>{null}</Page>;

  const { wallet, items, count, pending, access } = data;
  const paidActive = !!access && new Date(access.endsAt).getTime() > Date.now();
  const saved = items.reduce((sum, i) => sum + i.price, 0);
  const freeLeft = Math.max(0, FREE_CHECKOUTS - count);
  const cardW = (Math.min(width - PAD * 2, maxWidth) - GAP) / 2;

  return (
    <Page>
      <View style={styles.top}>
        <Brand />
        <Pressable onPress={() => router.push('/pengaturan')} accessibilityRole="button" accessibilityLabel="Pengaturan" hitSlop={12}>
          <Icon name="settings" size={22} />
        </Pressable>
      </View>

      {pending && (
        <Pressable
          style={styles.pending}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/bayar', params: { order: pending.id } })}
        >
          <Icon name="lock" size={18} color={colors.white} />
          <Text style={styles.pendingText}>Pembayaran {rupiah(pending.amount)} belum selesai</Text>
          <Icon name="arrowRight" size={18} color={colors.white} />
        </Pressable>
      )}

      <Text style={styles.savedLabel}>Total uang yang kamu selamatkan</Text>
      <Text style={styles.savedAmount}>{rupiah(saved)}</Text>
      <Text style={styles.savedSub}>dari {items.length} barang yang gak jadi kamu beli beneran</Text>

      <Card style={{ marginTop: 20, paddingVertical: 6 }}>
        <Row first label="Saldo bulan ini" value={rupiah(wallet.balance)} />
        <Row label="Sisa hutang" value={rupiah(wallet.debt)} />
      </Card>

      <View style={{ marginTop: 20, gap: 10 }}>
        <PrimaryButton label="Checkout palsu baru" icon="plus" onPress={() => router.push('/barang')} />
        <Text style={styles.free}>
          {paidActive && access
            ? `Paket ${PLANS[access.plan].name} aktif sampai ${shortDate(access.endsAt)}`
            : freeLeft > 0
              ? `Checkout gratis: ${freeLeft} dari ${FREE_CHECKOUTS} tersisa`
              : 'Checkout gratis sudah habis'}
        </Text>
      </View>

      <Text style={styles.section}>Koleksimu</Text>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="bag" size={28} color={colors.textFaint} />
          <Text style={styles.emptyText}>Belum ada barang. Coba checkout tumbler contoh dulu.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={{ width: cardW }}>
              <ItemPicture item={item} size={cardW} />
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>{rupiah(item.price)}</Text>
              <Text style={styles.itemDate}>
                {shortDate(item.date)}
                {item.hutang > 0 ? ' · pakai hutang' : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pending: {
    marginTop: 16,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.white },
  savedLabel: { ...type.small, marginTop: 28, color: colors.textSoft },
  savedAmount: { ...type.money, fontSize: 40, lineHeight: 48, marginTop: 2, color: colors.accent },
  savedSub: { ...type.small, color: colors.textSoft },
  free: { ...type.small, color: colors.textSoft, textAlign: 'center' },
  section: { ...type.h2, marginTop: 32, marginBottom: 14, color: colors.text },
  empty: { borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed', borderRadius: radius.lg, padding: 24, alignItems: 'center', gap: 10 },
  emptyText: { ...type.body, color: colors.textSoft, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, rowGap: 20 },
  itemName: { ...type.body, fontSize: 14, fontWeight: '600', marginTop: 8, color: colors.text },
  itemPrice: { fontSize: 14, fontWeight: '800', color: colors.text },
  itemDate: { ...type.small, fontSize: 12, color: colors.textFaint },
});
