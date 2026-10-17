import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Page, PrimaryButton } from '@/components/ui';
import { ApiError, requestLoginCode, verifyLoginCode } from '@/lib/api';
import { saveAccess } from '@/lib/plan';
import { setItem } from '@/lib/store';
import { track } from '@/lib/track';
import { colors, radius } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function message(e: unknown): string {
  if (!(e instanceof ApiError)) return 'Ada masalah. Coba lagi ya.';
  switch (e.code) {
    case 'too_soon':
      return 'Tunggu 1 menit sebelum minta kode lagi.';
    case 'too_many':
      return 'Terlalu banyak percobaan. Coba lagi 1 jam lagi.';
    case 'wrong_code':
      return `Kodenya salah. Sisa ${e.data.attemptsLeft ?? 0} percobaan.`;
    case 'expired':
      return 'Kodenya sudah tidak berlaku. Minta kode baru ya.';
    case 'offline':
      return 'Butuh internet. Cek koneksimu lalu coba lagi.';
    default:
      return 'Ada masalah. Coba lagi ya.';
  }
}

// S14. Log in with a 6-digit email code (new phone, new browser, or Chrome after Instagram).
export default function Masuk() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expiredAccess, setExpiredAccess] = useState(false);
  const clean = email.trim().toLowerCase();

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      await requestLoginCode(clean);
      setSent(true);
    } catch (e) {
      setError(message(e));
    }
    setBusy(false);
  };

  const verify = async () => {
    setBusy(true);
    setError('');
    try {
      const r = await verifyLoginCode(clean, code);
      await setItem('session', r.token);
      await setItem('payEmail', r.email);
      track('restore_login');
      if (r.plan && r.endsAt && new Date(r.endsAt).getTime() > Date.now()) {
        await saveAccess({ plan: r.plan, endsAt: r.endsAt, email: r.email });
        router.replace('/koleksi');
        return;
      }
      setExpiredAccess(true);
    } catch (e) {
      setError(message(e));
    }
    setBusy(false);
  };

  if (expiredAccess) {
    return (
      <Page>
        <Text style={styles.title}>Akses kamu sudah habis</Text>
        <Text style={styles.sub}>Kamu sudah masuk, tapi paketmu sudah berakhir. Mau lanjut lagi?</Text>
        <View style={styles.bottom}>
          <PrimaryButton label="Lihat paket" onPress={() => router.replace('/paywall')} />
          <Pressable onPress={() => router.replace('/')} accessibilityRole="button" style={styles.linkBtn}>
            <Text style={styles.link}>Nanti saja</Text>
          </Pressable>
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityRole="button">
        <Text style={styles.back}>‹ Kembali</Text>
      </Pressable>
      <Text style={styles.title}>Sudah bayar? Masuk</Text>
      <Text style={styles.sub}>Pakai email yang kamu pakai waktu bayar. Kami kirim kode 6 angka.</Text>

      <TextInput
        style={[styles.input, sent && styles.inputDone]}
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setSent(false);
          setCode('');
        }}
        placeholder="nama@email.com"
        placeholderTextColor={colors.textSoft}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        accessibilityLabel="Email"
      />

      {sent && (
        <>
          <Text style={styles.info}>
            Kalau email ini pernah dipakai untuk bayar, kodenya sudah kami kirim. Cek juga folder spam. Berlaku 10 menit.
          </Text>
          <TextInput
            style={[styles.input, styles.code]}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="______"
            placeholderTextColor={colors.textSoft}
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            accessibilityLabel="Kode 6 angka"
          />
        </>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.bottom}>
        {sent ? (
          <>
            <PrimaryButton label="Masuk" onPress={verify} disabled={code.length !== 6 || busy} />
            <Pressable onPress={send} accessibilityRole="button" style={styles.linkBtn} disabled={busy}>
              <Text style={styles.link}>Kirim ulang kode</Text>
            </Pressable>
          </>
        ) : (
          <PrimaryButton label="Kirim kode" onPress={send} disabled={!EMAIL_RE.test(clean) || busy} />
        )}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  back: { fontSize: 16, color: colors.textSoft, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { marginTop: 6, marginBottom: 20, fontSize: 16, lineHeight: 22, color: colors.textSoft },
  input: {
    borderWidth: 2,
    borderColor: colors.pink,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputDone: { borderColor: colors.mint },
  info: { marginTop: 14, marginBottom: 10, fontSize: 14, lineHeight: 20, color: colors.text },
  code: { fontSize: 28, letterSpacing: 10, textAlign: 'center', fontWeight: '800' },
  error: { marginTop: 12, fontSize: 14, color: colors.pinkDeep },
  bottom: { marginTop: 'auto', paddingTop: 24, gap: 8 },
  linkBtn: { alignSelf: 'center', padding: 10 },
  link: { fontSize: 15, color: colors.textSoft, textDecorationLine: 'underline' },
});
