import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Header, Notice, Page, PrimaryButton, SecondaryButton, Display } from '@/components/ui';
import { getItems } from '@/lib/collection';
import { monthKey, rupiah } from '@/lib/format';
import { isPaid } from '@/lib/plan';
import { monthLabel, monthSummary, previousMonth, type Recap } from '@/lib/recap';
import { recapImage, shareOrSave } from '@/lib/recapCard';
import { track } from '@/lib/track';
import { colors, radius, shape, type } from '@/theme';

// S15. Monthly recap (paid): a card to save or share. Never shows income or address.
export default function Rekap() {
  const [paid, setPaid] = useState<boolean | null>(null);
  const [which, setWhich] = useState<'this' | 'last'>('this');
  const [recaps, setRecaps] = useState<{ this: Recap; last: Recap } | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useFocusEffect(
    useCallback(() => {
      isPaid().then(setPaid);
      getItems().then((items) => {
        const now = monthKey();
        setRecaps({ this: monthSummary(items, now), last: monthSummary(items, previousMonth(now)) });
      });
    }, []),
  );

  const back = () => (router.canGoBack() ? router.back() : router.replace('/koleksi'));

  if (paid === false) {
    return (
      <Page>
        <Header title="Rekap bulanan" onBack={back} />
        <Display style={styles.title}>Rekap bulanan ada di paket berbayar</Display>
        <Text style={styles.sub}>Lihat berapa yang kamu selamatkan tiap bulan, lalu bagikan kartunya.</Text>
        <View style={styles.bottom}>
          <PrimaryButton label="Lihat paket" onPress={() => router.push('/paywall')} />
        </View>
      </Page>
    );
  }
  if (!recaps) return <Page>{null}</Page>;

  const r = recaps[which];
  const run = async (preferShare: boolean) => {
    setBusy(true);
    setNote('');
    const blob = await recapImage(r);
    if (blob) {
      const res = await shareOrSave(
        blob,
        `spirit-belongings-rekap-${r.month}.png`,
        `Bulan ini aku menyelamatkan ${rupiah(r.total)} pakai Spirit Belongings. Checkout palsu, dompet aman.`,
        preferShare,
      );
      track('recap_shared', { how: res });
      setNote(res === 'saved' ? 'Gambar disimpan. Cek folder Download atau galeri kamu.' : '');
    }
    setBusy(false);
  };

  return (
    <Page>
      <Header title="Rekap bulanan" onBack={back} />

      <View style={styles.tabs}>
        {(['this', 'last'] as const).map((k) => (
          <Pressable key={k} onPress={() => setWhich(k)} accessibilityRole="tab" accessibilityState={{ selected: which === k }} style={[styles.tab, which === k && styles.tabOn]}>
            <Text style={[styles.tabText, which === k && styles.tabTextOn]}>{monthLabel(recaps[k].month)}</Text>
          </Pressable>
        ))}
      </View>

      {/* Same content as the shared picture */}
      <Card style={styles.card}>
        <Text style={styles.brand}>SPIRIT BELONGINGS</Text>
        <Text style={styles.month}>Rekap {monthLabel(r.month)}</Text>
        <Text style={styles.lead}>Aku menyelamatkan</Text>
        <Display kind="money" style={styles.amount}>{rupiah(r.total)}</Display>
        <Text style={styles.count}>dari {r.count} barang yang gak jadi aku beli</Text>
        {r.top.map((i, n) => (
          <View key={n} style={styles.row}>
            <Text style={styles.rowName} numberOfLines={1}>
              {i.name}
            </Text>
            <Text style={styles.rowPrice}>{rupiah(i.price)}</Text>
          </View>
        ))}
        <Text style={styles.tagline}>Checkout palsu. Dompet aman.</Text>
      </Card>

      {r.count === 0 && (
        <View style={{ marginTop: 14 }}>
          <Notice icon="calendar">Belum ada checkout palsu di bulan ini.</Notice>
        </View>
      )}
      {!!note && <Text style={styles.note}>{note}</Text>}

      <View style={styles.bottom}>
        <PrimaryButton label="Bagikan" icon="share" onPress={() => run(true)} busy={busy} disabled={r.count === 0} />
        <SecondaryButton label="Simpan gambar" onPress={() => run(false)} disabled={busy || r.count === 0} />
        <Text style={styles.privacy}>Kartu ini tidak menampilkan uang bulanan, pengeluaran, atau alamatmu.</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { ...type.title, color: colors.text },
  sub: { ...type.body, marginTop: 8, color: colors.textSoft },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', borderWidth: shape.border, borderColor: 'transparent' },
  tabOn: { backgroundColor: colors.card, borderColor: colors.line, boxShadow: shape.shadowSm },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  tabTextOn: { color: colors.text },
  card: { padding: 24 },
  brand: { ...type.label, letterSpacing: 1.6, color: colors.text },
  month: { ...type.small, marginTop: 10, fontWeight: '600', color: colors.textSoft },
  lead: { ...type.body, marginTop: 18, fontWeight: '600', color: colors.text },
  amount: { ...type.money, fontSize: 40, lineHeight: 48, color: colors.accent },
  count: { ...type.small, color: colors.textSoft, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.divider },
  rowName: { ...type.body, flex: 1, color: colors.textSoft },
  rowPrice: { ...type.body, fontWeight: '700', color: colors.text },
  tagline: { ...type.body, fontWeight: '800', marginTop: 16, color: colors.text },
  note: { ...type.small, marginTop: 12, color: colors.textSoft, textAlign: 'center' },
  bottom: { marginTop: 'auto', paddingTop: 24, gap: 8 },
  privacy: { ...type.small, fontSize: 12, color: colors.textFaint, textAlign: 'center' },
});
