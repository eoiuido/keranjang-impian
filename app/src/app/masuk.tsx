import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { field, Header, Label, Notice, Page, PrimaryButton, TextButton, Display } from '@/components/ui';
import { ApiError, requestLoginCode, verifyLoginCode } from '@/lib/api';
import { restoreBackup, syncBackup } from '@/lib/backup';
import { saveAccess } from '@/lib/plan';
import { getProfile } from '@/lib/profile';
import { setItem } from '@/lib/store';
import { track } from '@/lib/track';
import { colors, type } from '@/theme';

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
      await restoreBackup(r.token); // balance, debt and items come back (photos stay on the old phone)
      if (r.plan && r.endsAt && new Date(r.endsAt).getTime() > Date.now()) {
        await saveAccess({ plan: r.plan, endsAt: r.endsAt, email: r.email });
        syncBackup();
        router.replace((await getProfile()) ? '/koleksi' : '/mulai');
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
      <Page skin="netral">
        <Header onBack={() => router.replace('/')} />
        <Display style={styles.title}>Akses kamu sudah habis</Display>
        <Text style={styles.sub}>Kamu sudah masuk, tapi paketmu sudah berakhir. Mau lanjut lagi?</Text>
        <View style={styles.bottom}>
          <PrimaryButton label="Lihat paket" onPress={() => router.replace('/paywall')} />
          <TextButton label="Nanti saja" onPress={() => router.replace('/')} />
        </View>
      </Page>
    );
  }

  return (
    <Page skin="netral">
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Display style={styles.title}>Sudah bayar? Masuk</Display>
      <Text style={styles.sub}>Pakai email yang kamu pakai waktu bayar. Kami kirim kode 6 angka.</Text>

      <Label style={styles.fieldLabel}>Email</Label>
      <TextInput
        style={field}
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setSent(false);
          setCode('');
        }}
        placeholder="nama@email.com"
        placeholderTextColor={colors.textFaint}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        accessibilityLabel="Email"
      />

      {sent && (
        <>
          <View style={{ marginTop: 16 }}>
            <Notice icon="mail">Kalau email ini pernah dipakai untuk bayar, kodenya sudah kami kirim. Cek juga folder spam. Berlaku 10 menit.</Notice>
          </View>
          <Label style={styles.fieldLabel}>Kode 6 angka</Label>
          <TextInput
            style={[field, styles.code]}
            value={code}
            onChangeText={(t) => setCode(t.replace(/D/g, '').slice(0, 6))}
            placeholder="000000"
            placeholderTextColor={colors.line}
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
            <PrimaryButton label="Masuk" onPress={verify} disabled={code.length !== 6} busy={busy} />
            <TextButton label="Kirim ulang kode" onPress={send} disabled={busy} />
          </>
        ) : (
          <PrimaryButton label="Kirim kode" onPress={send} disabled={!EMAIL_RE.test(clean)} busy={busy} />
        )}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { ...type.title, color: colors.text },
  sub: { ...type.body, marginTop: 6, color: colors.textSoft },
  fieldLabel: { marginTop: 24, marginBottom: 8 },
  code: { fontSize: 28, letterSpacing: 10, textAlign: 'center', fontWeight: '800' },
  error: { ...type.small, fontSize: 14, marginTop: 12, color: colors.warn },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 8 },
});
