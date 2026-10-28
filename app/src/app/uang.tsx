import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MoneySlider } from '@/components/MoneySlider';
import { Header, Label, Notice, Page, PrimaryButton } from '@/components/ui';
import { syncBackup } from '@/lib/backup';
import { getProfile, updateProfile } from '@/lib/profile';
import { colors, type } from '@/theme';

// Settings: change monthly money and expenses. Applies from next month (spec.md section 7).
export default function Uang() {
  const [money, setMoney] = useState<number | null>(null);
  const [expenses, setExpenses] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile().then((p) => {
      setMoney(p?.money ?? 1_500_000);
      setExpenses(p?.expenses ?? 1_000_000);
    });
  }, []);

  if (money === null) return <Page>{null}</Page>;
  const exp = Math.min(expenses, money);

  const save = async () => {
    setSaving(true);
    await updateProfile(money, exp);
    syncBackup();
    router.back();
  };

  return (
    <Page>
      <Header title="Uang bulanan" onBack={() => router.back()} />

      <Label style={styles.label}>Uang bulanan</Label>
      <MoneySlider label="Uang bulanan" value={money} onChange={setMoney} sliderMax={20_000_000} max={100_000_000} />

      <Label style={[styles.label, { marginTop: 32 }]}>Pengeluaran rutin</Label>
      <MoneySlider label="Pengeluaran rutin" value={exp} onChange={setExpenses} sliderMax={Math.min(20_000_000, money)} max={money} />

      <View style={{ marginTop: 28 }}>
        <Notice icon="alert">Perubahan berlaku mulai bulan depan. Saldo bulan ini tidak berubah.</Notice>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label="Simpan" onPress={save} busy={saving} />
        <Text style={styles.privacy}>Angka ini cuma disimpan di HP kamu (dan backup online kalau kamu berlangganan).</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 8, marginBottom: 4, textAlign: 'center' },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 10 },
  privacy: { ...type.small, color: colors.textSoft, textAlign: 'center' },
});
