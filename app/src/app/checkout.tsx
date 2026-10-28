import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FakeQR } from '@/components/FakeQR';
import { Icon, type IconName } from '@/components/Icon';
import { ItemPicture } from '@/components/ItemPicture';
import { ScanAnimation } from '@/components/ScanAnimation';
import { Card, field, Header, Label, Notice, Page, PrimaryButton, Row, SecondaryButton, Display } from '@/components/ui';
import { syncBackup } from '@/lib/backup';
import { cart } from '@/lib/cart';
import { completeCheckout, getAddress, saveAddress } from '@/lib/collection';
import { rupiah } from '@/lib/format';
import { payoffPlan, withInterest } from '@/lib/money';
import { needsPaywall } from '@/lib/plan';
import { getProfile, loadWallet } from '@/lib/profile';
import { useSkin } from '@/lib/skin';
import { track } from '@/lib/track';
import { colors, radius, type } from '@/theme';

type Stage = 'cart' | 'hutang' | 'pay' | 'qris' | 'scan' | 'processing';

// Generic payment names with our own outline icons; no real company names or logos.
const METHODS: { id: string; icon: IconName; note: string }[] = [
  { id: 'QRIS', icon: 'qr', note: 'Scan pakai aplikasi apa aja' },
  { id: 'E-wallet', icon: 'wallet', note: 'Dompet digital' },
  { id: 'Transfer bank', icon: 'bank', note: 'Virtual account' },
  { id: 'Kartu kredit', icon: 'card', note: 'Visa / Mastercard' },
  { id: 'COD', icon: 'truck', note: 'Bayar di tempat' },
];

const TITLES: Record<Stage, string> = {
  cart: 'Keranjang',
  hutang: 'Hutang',
  pay: 'Pembayaran',
  qris: 'Bayar',
  scan: 'Bayar',
  processing: 'Bayar',
};

const MIN_ADDRESS = 10;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// S5-S7. Fake checkout: cart + address, (hutang), payment choice, fake QRIS, scan.
export default function Checkout() {
  const item = cart.item;
  const skin = useSkin();
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

  const busy = stage === 'scan' || stage === 'processing';

  return (
    <View style={{ flex: 1 }}>
      {/* key: each stage starts scrolled to the top */}
      <Page key={busy ? 'qris' : stage}>
        <Header title={TITLES[stage]} onBack={busy ? undefined : back} />

        {stage === 'cart' && (
          <>
            {skin && (
              <Display style={styles.cartTitle}>
                {skin === 'butik' ? 'Satu langkah lagi, sayang.' : 'Checkout '}
                {skin === 'stiker' && <Text style={{ color: colors.accent }}>dulu! ♡</Text>}
              </Display>
            )}
            <View style={styles.itemRow}>
              <ItemPicture item={item} size={76} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Display kind="money" style={styles.itemPrice}>{rupiah(item.price)}</Display>
              </View>
            </View>

            <Label style={styles.label}>Alamat pengiriman</Label>
            <TextInput
              style={[field, styles.address]}
              multiline
              placeholder="Provinsi, kota, kecamatan, jalan, nomor rumah"
              placeholderTextColor={colors.textFaint}
              value={address}
              onChangeText={setAddress}
              maxLength={300}
              accessibilityLabel="Alamat pengiriman"
            />
            <View style={styles.hintRow}>
              <Icon name="lock" size={14} color={colors.textSoft} />
              <Text style={styles.hint}>Cuma disimpan di HP kamu. Gak dikirim ke mana pun.</Text>
            </View>

            <Card style={{ marginTop: 20, paddingVertical: 6 }}>
              <Row first label="Subtotal" value={rupiah(item.price)} />
              <Row label="Ongkir" value="Gratis" />
              <Row label="Total" value={rupiah(item.price)} strong />
            </Card>

            {balance !== null && (
              <View style={{ marginTop: 14 }}>
                {short > 0 ? (
                  <Notice tone="warn" icon="alert">
                    Saldo kamu kurang {rupiah(short)}. Kalau beli beneran, kamu bakal minus.
                  </Notice>
                ) : (
                  <Notice icon="wallet">
                    Saldo kamu {rupiah(balance)} → {rupiah(balance - item.price)}
                  </Notice>
                )}
              </View>
            )}

            <View style={styles.bottom}>
              {short > 0 && addressOk && <SecondaryButton label={`Pakai hutang ${rupiah(short)}`} onPress={() => toPayment(true)} />}
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
            <Card style={{ paddingVertical: 4, paddingHorizontal: 0 }}>
              {METHODS.map((m, i) => {
                const on = m.id === method;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setMethod(m.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    style={[styles.method, i > 0 && styles.methodLine]}
                  >
                    <View style={styles.methodIcon}>
                      <Icon name={m.icon} size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.methodName}>{m.id}</Text>
                      <Text style={styles.methodNote}>{m.note}</Text>
                    </View>
                    <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
                  </Pressable>
                );
              })}
            </Card>
            <View style={styles.bottom}>
              <PrimaryButton label={`Bayar ${rupiah(item.price)}`} onPress={() => setStage('qris')} />
            </View>
          </>
        )}

        {(stage === 'qris' || busy) && (
          <View style={styles.qrisWrap}>
            <Text style={styles.qrisMethod}>{method}</Text>
            <FakeQR size={210} />
            <Text style={styles.strike}>{rupiah(item.price)}</Text>
            <Display kind="money" style={styles.youPay}>Kamu bayar Rp0</Display>
            <View style={styles.bottomFull}>
              <PrimaryButton label="Scan & bayar" icon="qr" onPress={scanAndPay} disabled={stage !== 'qris'} />
            </View>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Simulasi. Tidak terhubung dengan toko, bank, atau penyedia pembayaran mana pun. Tidak ada uang yang terpotong.
        </Text>
      </Page>

      {busy && <ScanAnimation processing={stage === 'processing'} />}
    </View>
  );
}

// S5b. Fake paylater: show the true cost before they agree.
function HutangInfo({ amount, existing, monthly, onYes, onNo }: { amount: number; existing: number; monthly: number; onYes: () => void; onNo: () => void }) {
  const total = existing + amount;
  const next = withInterest(total);
  const plan = payoffPlan(total, monthly);
  return (
    <>
      <Label>Hutang baru</Label>
      <Display kind="money" style={styles.hutangAmount}>{rupiah(amount)}</Display>
      {existing > 0 && <Text style={styles.hutangText}>Total hutangmu jadi {rupiah(total)}.</Text>}

      <Card style={{ marginTop: 18, paddingVertical: 6 }}>
        <Row first label="Bunga" value="5% / bulan" />
        <Row label="Dipotong bulan depan" value={rupiah(next)} />
        <Row label="Perkiraan lunas" value={plan ? `${plan.months} bulan` : 'Tidak pernah'} />
        {plan && <Row label="Total yang kamu bayar" value={rupiah(plan.totalPaid)} strong />}
      </Card>

      <View style={{ marginTop: 14, gap: 10 }}>
        <Notice tone={plan && plan.months <= 12 ? 'info' : 'warn'} icon="alert">
          {plan
            ? plan.months > 12
              ? 'Ini butuh lebih dari 12 bulan buat lunas. Kalau belum lunas, sisanya kena 5% lagi tiap bulan.'
              : 'Kalau belum lunas, sisanya kena 5% lagi tiap bulan.'
            : `Dengan saldo bulanan ${rupiah(monthly)}, hutang ini gak akan pernah lunas.`}
        </Notice>
        <Text style={styles.sim}>Simulasi. Bukan pinjaman beneran.</Text>
      </View>

      <View style={styles.bottom}>
        <SecondaryButton label="Gak jadi" onPress={onNo} />
        <PrimaryButton label="Ya, pakai hutang" onPress={onYes} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cartTitle: { ...type.title, fontSize: 30, lineHeight: 34, color: colors.text, marginBottom: 18 },
  itemName: { ...type.body, fontWeight: '600', color: colors.text },
  itemPrice: { ...type.h2, marginTop: 2, color: colors.text },
  label: { marginTop: 24, marginBottom: 8 },
  address: { minHeight: 92, textAlignVertical: 'top' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  hint: { ...type.small, color: colors.textSoft, flex: 1 },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 10 },
  bottomFull: { alignSelf: 'stretch', marginTop: 24 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  methodLine: { borderTopWidth: 1, borderTopColor: colors.divider },
  methodIcon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  methodName: { fontSize: 15, fontWeight: '700', color: colors.text },
  methodNote: { ...type.small, color: colors.textSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.accent },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  qrisWrap: { alignItems: 'center', paddingTop: 8 },
  qrisMethod: { ...type.label, color: colors.textSoft, textTransform: 'uppercase', marginBottom: 14 },
  strike: { ...type.body, marginTop: 18, color: colors.textFaint, textDecorationLine: 'line-through' },
  youPay: { ...type.money, fontSize: 28, marginTop: 2, color: colors.text },
  hutangAmount: { ...type.money, fontSize: 36, lineHeight: 44, marginTop: 6, color: colors.text },
  hutangText: { ...type.body, color: colors.textSoft },
  sim: { ...type.small, fontWeight: '600', color: colors.textSoft, textAlign: 'center' },
  disclaimer: { ...type.small, fontSize: 12, marginTop: 24, color: colors.textFaint, textAlign: 'center' },
});
