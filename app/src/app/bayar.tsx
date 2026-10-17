import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Page, PrimaryButton, SecondaryButton } from '@/components/ui';
import { ApiError, createOrder, getOrder, type OrderInfo } from '@/lib/api';
import { rupiah } from '@/lib/format';
import { PLANS, type PlanId, saveAccess, setPendingOrder } from '@/lib/plan';
import { getItem, setItem } from '@/lib/store';
import { track } from '@/lib/track';
import { colors, radius } from '@/theme';

const HELP = 'eoi.uido@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POLL_MS = 3_000;

// Real money screens look different from the pastel fake checkout on purpose.
const REAL = { bg: '#F4F6FA', band: '#1F3A5F', text: '#14213D', soft: '#5B6475', line: '#D5DBE5' };

const ERRORS: Record<string, string> = {
  invalid_email: 'Email-nya belum benar. Cek lagi ya.',
  payment_unavailable: 'Pembayaran lagi gangguan. Coba lagi sebentar lagi.',
  offline: 'Butuh internet. Cek koneksimu lalu coba lagi.',
};

// S11 email + S12 "Pembayaran ASLI" (before DOKU), and the screens after DOKU sends the buyer back.
export default function Bayar() {
  const params = useLocalSearchParams<{ plan?: string; offer?: string; order?: string }>();
  return params.order ? <Confirm orderId={params.order} /> : <Start plan={params.plan === 'weekly' ? 'weekly' : 'yearly'} offer={params.offer === '1'} />;
}

function Start({ plan, offer }: { plan: PlanId; offer: boolean }) {
  const p = PLANS[plan];
  const shownPrice = plan === 'yearly' && offer ? PLANS.yearly.offerPrice : p.price;
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const valid = EMAIL_RE.test(email.trim());

  useEffect(() => {
    getItem<string>('payEmail').then((e) => e && setEmail(e));
  }, []);

  const pay = async () => {
    setBusy(true);
    setError('');
    const clean = email.trim().toLowerCase();
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
    <RealPage>
      <Text style={s.title}>
        {p.name}: {rupiah(shownPrice)} / {p.period}
      </Text>
      <Text style={s.sub}>Dibayar sekali. Tidak diperpanjang otomatis.</Text>

      <Text style={s.label}>Email kamu</Text>
      <TextInput
        style={s.input}
        value={email}
        onChangeText={setEmail}
        placeholder="nama@email.com"
        placeholderTextColor={REAL.soft}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        accessibilityLabel="Email"
      />
      <Text style={s.hint}>
        {valid ? `Pastikan benar: ${email.trim().toLowerCase()}` : 'Buat simpan akses & backup, dan masuk lagi kalau ganti HP.'}
      </Text>

      <View style={s.box}>
        <Text style={s.boxText}>Kamu akan dibawa ke halaman pembayaran DOKU (QRIS & e-wallet).</Text>
        <Text style={s.boxText}>Setelah bayar, kamu otomatis kembali ke sini.</Text>
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}

      <View style={s.bottom}>
        <Pressable
          onPress={pay}
          disabled={!valid || busy}
          accessibilityRole="button"
          style={({ pressed }) => [s.payBtn, pressed && { opacity: 0.85 }, (!valid || busy) && { opacity: 0.4 }]}
        >
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.payText}>Bayar {rupiah(shownPrice)}</Text>}
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={s.cancel}>
          <Text style={s.cancelText}>Batal</Text>
        </Pressable>
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
    const until = order.endsAt
      ? new Date(order.endsAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    return (
      <Page>
        <View style={s.thanks}>
          <Text style={s.thanksBig}>Terima kasih!</Text>
          <Text style={s.thanksText}>Pembayaran {rupiah(order.amount)} berhasil.</Text>
          <Text style={s.thanksText}>Akses aktif sampai {until}.</Text>
          <Text style={s.thanksSmall}>Akses tersimpan di email {order.email}.</Text>
        </View>
        <View style={s.bottom}>
          <PrimaryButton label="Lanjut checkout palsu" onPress={() => router.replace('/barang')} />
          <SecondaryButton label="Lihat koleksi" onPress={() => router.replace('/koleksi')} />
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
          <Pressable onPress={() => router.replace({ pathname: '/bayar', params: { plan: order.plan } })} style={s.payBtn} accessibilityRole="button">
            <Text style={s.payText}>Coba lagi</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/koleksi')} accessibilityRole="button" style={s.cancel}>
            <Text style={s.cancelText}>Nanti saja</Text>
          </Pressable>
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
          Jumlah yang masuk berbeda dengan harga. Kami akan cek dan menghubungimu lewat email dalam 2 hari kerja. Kalau
          perlu, uangmu dikembalikan.
        </Text>
        <View style={s.bottom}>
          <Help />
        </View>
      </RealPage>
    );
  }

  return (
    <RealPage>
      <View style={s.waiting}>
        <ActivityIndicator size="large" color={REAL.band} />
        <Text style={s.title}>Menunggu konfirmasi…</Text>
        <Text style={s.sub}>
          {offline ? 'Koneksi terputus. Kami coba lagi otomatis.' : 'Biasanya cuma beberapa detik setelah kamu bayar.'}
        </Text>
      </View>
      {waitedLong && order?.paymentUrl && (
        <View style={s.box}>
          <Text style={s.boxText}>Belum bayar? Halaman pembayaranmu masih bisa dibuka.</Text>
          <Pressable onPress={() => order.paymentUrl && Linking.openURL(order.paymentUrl)} accessibilityRole="button">
            <Text style={s.link}>Buka halaman pembayaran</Text>
          </Pressable>
          <Text style={[s.boxText, { marginTop: 8 }]}>Sudah bayar tapi belum aktif? Tunggu sebentar, kami cek otomatis.</Text>
        </View>
      )}
      <View style={s.bottom}>
        <Pressable onPress={() => router.replace('/koleksi')} accessibilityRole="button" style={s.cancel}>
          <Text style={s.cancelText}>Kembali ke koleksi</Text>
        </Pressable>
        <Help />
      </View>
    </RealPage>
  );
}

function RealPage({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: REAL.bg }}>
      <View style={s.band}>
        <Text style={s.bandText}>🔒 Pembayaran ASLI · uang beneran</Text>
      </View>
      <Page bg={REAL.bg}>{children}</Page>
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
  band: { backgroundColor: REAL.band, paddingVertical: 10, alignItems: 'center' },
  bandText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  title: { marginTop: 8, fontSize: 24, fontWeight: '800', color: REAL.text },
  sub: { marginTop: 6, fontSize: 15, lineHeight: 21, color: REAL.soft },
  label: { marginTop: 24, marginBottom: 8, fontSize: 15, fontWeight: '700', color: REAL.text },
  input: {
    borderWidth: 2,
    borderColor: REAL.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: REAL.text,
    backgroundColor: '#FFFFFF',
  },
  hint: { marginTop: 6, fontSize: 13, color: REAL.soft },
  box: { marginTop: 20, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: REAL.line, padding: 14, gap: 4 },
  boxText: { fontSize: 14, lineHeight: 20, color: REAL.text },
  link: { marginTop: 6, fontSize: 15, fontWeight: '700', color: REAL.band, textDecorationLine: 'underline' },
  error: { marginTop: 14, fontSize: 14, color: '#B42318' },
  bottom: { marginTop: 'auto', paddingTop: 24, gap: 8 },
  payBtn: { backgroundColor: REAL.band, borderRadius: radius.pill, paddingVertical: 18, alignItems: 'center' },
  payText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  cancel: { alignSelf: 'center', padding: 10 },
  cancelText: { fontSize: 15, color: REAL.soft, textDecorationLine: 'underline' },
  help: { fontSize: 12, color: REAL.soft, textAlign: 'center' },
  helpLink: { color: REAL.text, textDecorationLine: 'underline' },
  waiting: { alignItems: 'center', paddingTop: 40, gap: 8 },
  thanks: { alignItems: 'center', paddingTop: 40, gap: 6 },
  thanksBig: { fontSize: 32, fontWeight: '900', color: colors.pinkDeep },
  thanksText: { fontSize: 17, color: colors.text, textAlign: 'center' },
  thanksSmall: { marginTop: 6, fontSize: 13, color: colors.textSoft, textAlign: 'center' },
});
