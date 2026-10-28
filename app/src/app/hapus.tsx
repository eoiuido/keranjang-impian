import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, field, Header, Label, Notice, Page, PrimaryButton, TextButton } from '@/components/ui';
import { deleteEverything, getSessionToken } from '@/lib/account';
import { ApiError } from '@/lib/api';
import { colors, type } from '@/theme';

const WORD = 'HAPUS';

// "Hapus semua data" (UU PDP). Typing HAPUS prevents deleting by accident.
export default function Hapus() {
  const [online, setOnline] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSessionToken().then((t) => setOnline(!!t));
  }, []);

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await deleteEverything();
      router.replace('/');
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === 'offline'
          ? 'Butuh internet untuk menghapus data di server. Cek koneksimu lalu coba lagi.'
          : 'Ada masalah. Coba lagi, atau email eoi.uido@gmail.com.',
      );
      setBusy(false);
    }
  };

  return (
    <Page>
      <Header title="Hapus semua data" onBack={() => router.back()} />
      <Text style={styles.title}>Yakin mau hapus semua?</Text>
      <Text style={styles.sub}>Ini tidak bisa dibatalkan.</Text>

      <Card style={{ marginTop: 20, gap: 8 }}>
        <Text style={styles.point}>• Koleksi, saldo, hutang, dan alamat di HP ini</Text>
        {online && <Text style={styles.point}>• Akun, backup online, dan login di semua HP</Text>}
        {online && <Text style={styles.point}>• Paket berbayarmu yang masih aktif ikut berakhir</Text>}
      </Card>

      {online && (
        <View style={{ marginTop: 14 }}>
          <Notice tone="warn" icon="alert">
            Catatan pembayaran disimpan tanpa email untuk keperluan pembukuan, sesuai kewajiban hukum.
          </Notice>
        </View>
      )}

      <Label style={styles.label}>Ketik {WORD} untuk konfirmasi</Label>
      <TextInput
        style={field}
        value={text}
        onChangeText={setText}
        autoCapitalize="characters"
        placeholder={WORD}
        placeholderTextColor={colors.line}
        accessibilityLabel={`Ketik ${WORD}`}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.bottom}>
        <PrimaryButton tone="ink" label="Hapus semua data" onPress={confirm} disabled={text.trim().toUpperCase() !== WORD} busy={busy} />
        <TextButton label="Batal" onPress={() => router.back()} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { ...type.title, color: colors.text },
  sub: { ...type.body, marginTop: 6, color: colors.textSoft },
  point: { ...type.body, color: colors.text },
  label: { marginTop: 24, marginBottom: 8 },
  error: { ...type.small, fontSize: 14, marginTop: 10, color: colors.warn },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 8 },
});
