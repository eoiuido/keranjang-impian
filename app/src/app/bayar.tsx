import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { SuccessMark } from '@/components/SuccessMark';
import { Card, field, Header, Label, Notice, Page, PrimaryButton, Row, SecondaryButton, TextButton } from '@/components/ui';
import { ApiError, createOrder, getOrder, type OrderInfo } from '@/lib/api';
import { restoreBackup, syncBackup } from '@/lib/backup';
import { rupiah } from '@/lib/format';
import { PLANS, type PlanId, saveAccess, setPendingOrder } from '@/lib/plan';
import { getItem, setItem } from '@/lib/store';
import { track } from '@/lib/track';
import { colors, radius, type } from '@/theme';

const HELP = 'eoi.uido@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POLL_MS = 3_000;

const ERRORS: Record<string, string> = {
  invalid_email: 'Email-nya belum benar. Cek lagi ya.',
  payment_unavailable: 'Pembayaran lagi gangguan. Coba lagi sebentar lagi.',
  offline: 'Butuh internet. Cek koneksimu lalu coba lagi.',
};

const longDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

// S11 email + S12 "Pembayaran ASLI" (before DOKU), and the screens after DOKU sends the buyer back.
// Real-money screens use dark buttons and a lock band, never the pink of the fake checkout.
export default function Bayar() {
  const params = useLocalSearchParams<{ plan?: string; offer?: string; order?: string }>();
  return params.order ? (
    <Confirm orderId={params.order} />
  ) : (
    <Start plan={params.plan === 'weekly' ? 'weekly' : 'yearly'} offer={params.offer === '1'} />
  );
}

function Start({ plan, offer }: { plan: PlanId; offer: boolean }) {
  const p = PLANS[plan];
  const shownPrice = plan === 'yearly' && offer ? PLANS.yearly.offerPrice : p.price;
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const clean = email.trim().toLowerCase();
  const valid = EMAIL_RE.test(clean);

  useEffect(() => {
    getItem<string>('payEmail').then((e) => e && setEmail(e));
  }, []);

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const o = await createOrder(clean, plan, offer);
      await setItem('payEmail', clean);
      await setPendingOrder({ id: o.orderId, plan: o.plan, amount: o.amount });
      track('purchase_started', { plan, price: o.amount });
      if (!o.paymentUrl) throw new ApiError('payment_unavailable');
      // Same tab, so DOKU can send the buyer straight back to us.
      if (Platform.OS === 'web') window.location.assign(o.paymentUrl);
      else await Linking.openURL(o.paymentUrl);
    } catch (e) {
      setError(ERRORS[e instanceof ApiError ? e.code : ''] ?? 'Ada masalah. Coba lagi ya.');
      setBusy(false);
    }
  };

  return (
    <RealPage onBack={() => router.back()}>
      <Label>Paket {p.name}</Label>
      <Text style={s.price}>
        {rupiah(shownPrice)} <Text style={s.period}>/ {p.period}</Text>
      </Text>
      <Text style={s.sub}>Dibayar sekali. Tidak diperpanjang otomatis.</Text>

      <Label style={s.fieldLabel}>Email kamu</Label>
      <TextInput
        style={field}
        value={email}
        onChangeText={setEmail}
        placeholder="nama@email.com"
        placeholderTextColor={colors.textFaint}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        accessibilityLabel="Email"
      />
      <Text style={s.hint}>{valid ? `Pastikan benar: ${clean}` : 'Buat simpan akses & backup, dan masuk lagi kalau ganti HP.'}</Text>

      <View style={{ marginTop: 20 }}>
        <Notice icon="lock">Kamu akan dibawa ke halaman pembayaran DOKU (QRIS & e-wallet). Setelah bayar, kamu otomatis kembali ke sini.</Notice>
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}

      <View style={s.bottom}>
        <PrimaryButton tone="ink" icon="lock" label={`Bayar ${rupiah(shownPrice)}`} onPress={pay} disabled={!valid} busy={busy} />
        <TextButton label="Batal" onPress={() => router.back()} />
        <Help />
      </View>
    </RealPage>
  );
}

function Confirm({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [offline, setOffline] = useState(false);
  const [waitedLong, setWaitedLong] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();
    const poll = async () => {
      try {
        const o = await getOrder(orderId);
        setOffline(false);
        setOrder(o);
        if (o.status === 'paid' && o.endsAt && o.email && !done.current) {
          done.current = true;
          await saveAccess({ plan: o.plan, endsAt: o.endsAt, email: o.email }, o.token);
          await setPendingOrder(null);
          track('purchase', { plan: o.plan, price: o.amount });
          // Same email paid before on another phone? Merge that backup, then save this phone's numbers.
          if (o.token) await restoreBackup(o.token);
          syncBackup();
          return;
        }
        if (o.status === 'expired' || o.status === 'review') {
          await setPendingOrder(null);
          return;
        }
      } catch (e) {
        if (e instanceof ApiError && e.code === 'not_found') {
          setOrder(null);
          return;
        }
        setOffline(true);
      }
      if (Date.now() - started > 60_000) setWaitedLong(true);
      timer = setTimeout(poll, POLL_MS);
    };
    poll();
    return () => clearTimeout(timer);
  }, [orderId]);

  if (order?.status === 'paid') {
    return (
      <Page skin="netral">
        <View style={s.center}>
          <SuccessMark />
          <Text style={s.thanksBig}>Terima kasih!</Text>
          <Text style={s.thanksText}>Paket {PLANS[order.plan].name} kamu sudah aktif.</Text>
        </View>
        <Card style={{ marginTop: 28, paddingVertical: 6 }}>
          <Row first label="Dibayar" value={rupiah(order.amount)} />
          <Row label="Aktif sampai" value={order.endsAt ? longDate(order.endsAt) : '-'} />
          <Row label="Email" value={order.email ?? '-'} />
        </Card>
        <View style={s.bottom}>
          <PrimaryButton label="Pasang target tabungan" icon="target" onPress={() => router.replace('/target')} />
          <SecondaryButton label="Lanjut checkout palsu" onPress={() => router.replace('/barang')} />
        </View>
      </Page>
    );
  }

  if (order?.status === 'expired') {
    return (
      <RealPage>
        <Text style={s.title}>Waktu bayar habis</Text>
        <Text style={s.sub}>Belum ada pembayaran yang masuk, jadi tidak ada uang yang terpotong.</Text>
        <View style={s.bottom}>
          <PrimaryButton tone="ink" label="Coba lagi" onPress={() => router.replace({ pathname: '/bayar', params: { plan: order.plan } })} />
          <TextButton label="Nanti saja" onPress={() => router.replace('/koleksi')} />
          <Help />
        </View>
      </RealPage>
    );
  }

  if (order?.status === 'review') {
    return (
      <RealPage>
        <Text style={s.title}>Pembayaranmu sedang kami cek</Text>
        <Text style={s.sub}>
          Jumlah yang masuk berbeda dengan harga. Kami akan cek dan menghubungimu lewat email dalam 2 hari kerja. Kalau perlu, uangmu
          dikembalikan.
        </Text>
        <View style={s.bottom}>
          <Help />
        </View>
      </RealPage>
    );
  }

  return (
    <RealPage>
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.ink} />
        <Text style={s.title}>Menunggu konfirmasi…</Text>
        <Text style={[s.sub, { textAlign: 'center' }]}>
          {offline ? 'Koneksi terputus. Kami coba lagi otomatis.' : 'Biasanya cuma beberapa detik setelah kamu bayar.'}
        </Text>
      </View>
      {waitedLong && order?.paymentUrl && (
        <View style={{ marginTop: 24, gap: 10 }}>
          <Notice icon="alert">Belum bayar? Halaman pembayaranmu masih bisa dibuka. Sudah bayar? Tunggu sebentar, kami cek otomatis.</Notice>
          <SecondaryButton label="Buka halaman pembayaran" onPress={() => order.paymentUrl && Linking.openURL(order.paymentUrl)} />
        </View>
      )}
      <View style={s.bottom}>
        <TextButton label="Kembali ke koleksi" onPress={() => router.replace('/koleksi')} />
        <Help />
      </View>
    </RealPage>
  );
}

function RealPage({ children, onBack }: { children: ReactNode; onBack?: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.band}>
        <Icon name="lock" size={14} color={colors.white} strokeWidth={2} />
        <Text style={s.bandText}>Pembayaran ASLI · uang beneran</Text>
      </View>
      <Page skin="netral">
        <Header onBack={onBack} />
        {children}
      </Page>
    </View>
  );
}

function Help() {
  return (
    <Text style={s.help}>
      Bantuan:{' '}
      <Text style={s.helpLink} onPress={() => Linking.openURL(`mailto:${HELP}`)}>
        {HELP}
      </Text>
      {' · '}
      <Text style={s.helpLink} onPress={() => router.push('/refund')}>
        Kebijakan refund
      </Text>
    </Text>
  );
}

const s = StyleSheet.create({
  band: { backgroundColor: colors.ink, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  bandText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  price: { ...type.money, marginTop: 6, color: colors.text },
  period: { fontSize: 15, fontWeight: '600', color: colors.textSoft },
  title: { ...type.title, fontSize: 24, marginTop: 8, color: colors.text },
  sub: { ...type.body, marginTop: 6, color: colors.textSoft },
  fieldLabel: { marginTop: 28, marginBottom: 8 },
  hint: { ...type.small, marginTop: 8, color: colors.textSoft },
  error: { ...type.small, fontSize: 14, marginTop: 14, color: colors.warn },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 8 },
  help: { ...type.small, fontSize: 12, color: colors.textSoft, textAlign: 'center' },
  helpLink: { color: colors.text, textDecorationLine: 'underline' },
  center: { alignItems: 'center', paddingTop: 36, gap: 10 },
  thanksBig: { ...type.title, marginTop: 8, color: colors.text },
  thanksText: { ...type.body, color: colors.textSoft, textAlign: 'center' },
});
