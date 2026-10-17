import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FakeQR } from '@/components/FakeQR';
import { ItemPicture } from '@/components/ItemPicture';
import { ScanAnimation } from '@/components/ScanAnimation';
import { Page, PrimaryButton, SecondaryButton } from '@/components/ui';
import { syncBackup } from '@/lib/backup';
import { cart } from '@/lib/cart';
import { completeCheckout, getAddress, saveAddress } from '@/lib/collection';
import { rupiah } from '@/lib/format';
import { payoffPlan, withInterest } from '@/lib/money';
import { needsPaywall } from '@/lib/plan';
import { getProfile, loadWallet } from '@/lib/profile';
import { track } from '@/lib/track';
import { colors, radius } from '@/theme';

type Stage = 'cart' | 'hutang' | 'pay' | 'qris' | 'scan' | 'processing';

// Generic payment names with our own simple icons; no real company names or logos.
const METHODS = [
  { id: 'QRIS', icon: '▦', note: 'Scan pakai aplikasi apa aja' },
  { id: 'E-wallet', icon: '◍', note: 'Dompet digital' },
  { id: 'Transfer bank', icon: '⌂', note: 'Virtual account' },
  { id: 'Kartu kredit', icon: '▭', note: 'Visa / Mastercard' },
  { id: 'COD', icon: '◫', note: 'Bayar di tempat' },
];

const MIN_ADDRESS = 10;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// S5-S7. Fake checkout: cart + address, (hutang), payment choice, fake QRIS, scan.
export default function Checkout() {
  const item = cart.item;
  const [stage, setStage] = useState<Stage>('cart');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [debt, setDebt] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [useHutang, setUseHutang] = useState(false);
  const [method, setMethod] = useState('QRIS');

  useEffect(() => {
    needsPaywall().then((locked) => locked && router.replace('/paywall'));
    getAddress().then(setAddress);
    loadWallet().then((w) => {
      setBalance(w?.balance ?? 0);
      setDebt(w?.debt ?? 0);
    });
    getProfile().then((p) => setMonthly(p ? p.money - p.expenses : 0));
  }, []);

  if (!item) return <Redirect href="/barang" />;

  const short = balance !== null && item.price > balance ? item.price - balance : 0;
  const addressOk = address.trim().length >= MIN_ADDRESS;

  const back = () => {
    if (stage === 'hutang') setStage('cart');
    else if (stage === 'pay') setStage(useHutang ? 'hutang' : 'cart');
    else if (stage === 'qris') setStage('pay');
    else router.back();
  };

  const toPayment = async (hutang: boolean) => {
    await saveAddress(address.trim());
    setUseHutang(hutang);
    setStage(hutang ? 'hutang' : 'pay');
  };

  const scanAndPay = async () => {
    setStage('scan');
    await wait(1800);
    setStage('processing');
    const [result] = await Promise.all([completeCheckout(item, method, useHutang), wait(1000)]);
    cart.item = null;
    syncBackup(); // paid users: keep the online copy current (runs in the background)
    if (result.count === 1) track('first_fake_checkout_done', { price: item.price });
    track('fake_checkout_done', { count: result.count, price: item.price, method });
    if (result.item.hutang > 0) track('hutang_used', { amount: result.item.hutang });
    router.replace('/berhasil');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* key: each stage starts scrolled to the top */}
      <Page key={stage === 'scan' || stage === 'processing' ? 'qris' : stage}>
        <View style={styles.header}>
          <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Kembali" hitSlop={12}>
            <Text style={styles.back}>‹ Kembali</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {stage === 'cart'
              ? 'Keranjang'
              : stage === 'hutang'
                ? 'Hutang'
                : stage === 'pay'
                  ? 'Pilih pembayaran'
                  : 'Pembayaran'}
          </Text>
          <View style={{ width: 70 }} />
        </View>

        {stage === 'cart' && (
          <>
            <View style={styles.card}>
              <View style={styles.itemRow}>
                <ItemPicture item={item} size={72} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>{rupiah(item.price)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Alamat pengiriman</Text>
            <TextInput
              style={styles.address}
              multiline
              placeholder="Provinsi, kota, kecamatan, jalan, nomor rumah"
              placeholderTextColor={colors.textSoft}
              value={address}
              onChangeText={setAddress}
              maxLength={300}
              accessibilityLabel="Alamat pengiriman"
            />
            <Text style={styles.hint}>Cuma disimpan di HP kamu. Gak dikirim ke mana pun.</Text>

            <View style={styles.card}>
              <Row label="Subtotal" value={rupiah(item.price)} />
              <Row label="Ongkir" value="Gratis" />
              <View style={styles.divider} />
              <Row label="Total" value={rupiah(item.price)} bold />
            </View>

            {balance !== null &&
              (short > 0 ? (
                <View style={[styles.balanceBox, { backgroundColor: colors.butter }]}>
                  <Text style={styles.balanceText}>
                    Saldo kamu kurang {rupiah(short)}. Kalau beli beneran, kamu bakal minus.
                  </Text>
                </View>
              ) : (
                <View style={[styles.balanceBox, { backgroundColor: colors.mint }]}>
                  <Text style={styles.balanceText}>
                    Saldo kamu: {rupiah(balance)} → {rupiah(balance - item.price)}
                  </Text>
                </View>
              ))}

            <View style={styles.bottom}>
              {short > 0 && addressOk && (
                <SecondaryButton label={`Pakai Hutang ${rupiah(short)}`} onPress={() => toPayment(true)} />
              )}
              <PrimaryButton
                label={addressOk ? (short > 0 ? 'Tetap checkout' : 'Pilih pembayaran') : 'Isi alamat dulu'}
                onPress={() => toPayment(false)}
                disabled={!addressOk}
              />
            </View>
          </>
        )}

        {stage === 'hutang' && <HutangInfo amount={short} existing={debt} monthly={monthly} onYes={() => setStage('pay')} onNo={back} />}

        {stage === 'pay' && (
          <>
            <View style={styles.methods}>
              {METHODS.map((m) => {
                const on = m.id === method;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setMethod(m.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    style={[styles.method, on && styles.methodOn]}
                  >
                    <Text style={styles.methodIcon}>{m.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.methodName}>{m.id}</Text>
                      <Text style={styles.methodNote}>{m.note}</Text>
                    </View>
                    <View style={[styles.radio, on && styles.radioOn]} />
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.bottom}>
              <PrimaryButton label={`Bayar sekarang · ${rupiah(item.price)}`} onPress={() => setStage('qris')} />
            </View>
          </>
        )}

        {(stage === 'qris' || stage === 'scan' || stage === 'processing') && (
          <View style={styles.qrisWrap}>
            <Text style={styles.qrisMethod}>{method}</Text>
            <FakeQR size={220} />
            <Text style={styles.strike}>{rupiah(item.price)}</Text>
            <Text style={styles.youPay}>Kamu bayar: Rp0</Text>
            <View style={styles.bottomFull}>
              <PrimaryButton label="Scan & Bayar" onPress={scanAndPay} disabled={stage !== 'qris'} />
            </View>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Simulasi. Tidak terhubung dengan toko, bank, atau penyedia pembayaran mana pun. Tidak ada uang yang
          terpotong.
        </Text>
      </Page>

      {(stage === 'scan' || stage === 'processing') && <ScanAnimation processing={stage === 'processing'} />}
    </View>
  );
}

// S5b. Fake paylater: show the true cost before they agree.
function HutangInfo({
  amount,
  existing,
  monthly,
  onYes,
  onNo,
}: {
  amount: number;
  existing: number;
  monthly: number;
  onYes: () => void;
  onNo: () => void;
}) {
  const total = existing + amount;
  const next = withInterest(total);
  const plan = payoffPlan(total, monthly);
  return (
    <>
      <View style={[styles.card, styles.hutangCard]}>
        <Text style={styles.hutangLabel}>Hutang baru</Text>
        <Text style={styles.hutangAmount}>{rupiah(amount)}</Text>
        {existing > 0 && <Text style={styles.hutangText}>Total hutangmu jadi {rupiah(total)}.</Text>}
        <Text style={styles.hutangText}>
          Bulan depan dipotong {rupiah(next)} dari saldomu (bunga 5%/bulan). Kalau belum lunas, sisanya kena 5% lagi.
        </Text>
      </View>

      <View style={[styles.balanceBox, { backgroundColor: plan && plan.months <= 12 ? colors.lavender : colors.butter }]}>
        <Text style={styles.balanceText}>
          {plan
            ? `Perkiraan lunas: ${plan.months} bulan. Total yang kamu bayar: ${rupiah(plan.totalPaid)}.`
            : `Dengan saldo bulanan ${rupiah(monthly)}, hutang ini gak akan pernah lunas.`}
        </Text>
        {plan && plan.months > 12 && (
          <Text style={[styles.balanceText, styles.warn]}>Ini butuh lebih dari 12 bulan buat lunas.</Text>
        )}
      </View>

      <Text style={styles.sim}>Simulasi. Bukan pinjaman beneran.</Text>

      <View style={styles.bottom}>
        <SecondaryButton label="Gak jadi" onPress={onNo} />
        <PrimaryButton label="Ya, pakai hutang" onPress={onYes} />
      </View>
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowText, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowText, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  back: { width: 70, fontSize: 16, color: colors.textSoft },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, gap: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.text },
  itemPrice: { marginTop: 2, fontSize: 18, fontWeight: '800', color: colors.text },
  label: { marginTop: 20, marginBottom: 8, fontSize: 15, fontWeight: '700', color: colors.text },
  address: {
    minHeight: 90,
    borderWidth: 2,
    borderColor: colors.pink,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    textAlignVertical: 'top',
  },
  hint: { marginTop: 6, marginBottom: 20, fontSize: 13, color: colors.textSoft },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowText: { fontSize: 15, color: colors.text },
  bold: { fontSize: 17, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.pink },
  balanceBox: { marginTop: 16, borderRadius: radius.md, padding: 14 },
  balanceText: { fontSize: 15, lineHeight: 21, color: colors.text, textAlign: 'center' },
  bottom: { marginTop: 'auto', paddingTop: 24, gap: 10 },
  hutangCard: { alignItems: 'center', backgroundColor: colors.card },
  hutangLabel: { fontSize: 15, color: colors.textSoft },
  hutangAmount: { fontSize: 34, fontWeight: '900', color: colors.pinkDeep },
  hutangText: { fontSize: 15, lineHeight: 21, color: colors.text, textAlign: 'center' },
  warn: { marginTop: 6, fontWeight: '700' },
  sim: { marginTop: 16, fontSize: 14, fontWeight: '700', color: colors.textSoft, textAlign: 'center' },
  bottomFull: { alignSelf: 'stretch', marginTop: 24 },
  methods: { gap: 10 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodOn: { borderColor: colors.pinkDeep },
  methodIcon: {
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    fontSize: 22,
    borderRadius: 12,
    backgroundColor: colors.lavender,
    color: colors.text,
    overflow: 'hidden',
  },
  methodName: { fontSize: 16, fontWeight: '700', color: colors.text },
  methodNote: { fontSize: 13, color: colors.textSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.pink },
  radioOn: { borderWidth: 7, borderColor: colors.pinkDeep },
  qrisWrap: { alignItems: 'center' },
  qrisMethod: { marginBottom: 12, fontSize: 15, fontWeight: '700', color: colors.textSoft },
  strike: { marginTop: 16, fontSize: 18, color: colors.textSoft, textDecorationLine: 'line-through' },
  youPay: { marginTop: 2, fontSize: 28, fontWeight: '800', color: colors.text },
  disclaimer: { marginTop: 20, fontSize: 12, lineHeight: 17, color: colors.textSoft, textAlign: 'center' },
});
