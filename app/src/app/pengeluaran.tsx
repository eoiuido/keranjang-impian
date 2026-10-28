import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MoneySlider } from '@/components/MoneySlider';
import { onboarding } from '@/components/onboarding';
import { Card, Header, Label, Page, PrimaryButton, Steps } from '@/components/ui';
import { rupiah } from '@/lib/format';
import { completeOnboarding, draft } from '@/lib/profile';
import { track } from '@/lib/track';
import { colors, type } from '@/theme';

// S3. Onboarding 2: monthly expenses, then this month's dream balance.
export default function Pengeluaran() {
  const money = draft.money;
  const [expenses, setExpenses] = useState(Math.min(draft.expenses, money));
  const [saving, setSaving] = useState(false);

  // Opened directly (e.g. after a refresh) without step 1: start again.
  if (!money) return <Redirect href="/mulai" />;

  const balance = money - expenses;
  const atLimit = expenses >= money;

  const next = async () => {
    setSaving(true);
    draft.expenses = expenses;
    await completeOnboarding(money, expenses);
    track('onboarding_complete');
    router.replace('/barang');
  };

  return (
    <Page>
      <Header onBack={() => router.back()} />
      <Steps current={2} total={2} />
      <Text style={onboarding.title}>Pengeluaran rutin sebulan kira-kira?</Text>
      <Text style={onboarding.sub}>Makan, transport, kos, pulsa. Satu angka kasar aja.</Text>

      <View style={onboarding.slider}>
        <MoneySlider
          label="Pengeluaran rutin sebulan"
          value={expenses}
          onChange={setExpenses}
          sliderMax={Math.min(20_000_000, money)}
          max={money}
        />
        {atLimit && <Text style={styles.limit}>Pengeluaran gak bisa lebih dari uang bulanan.</Text>}
      </View>

      <Card style={styles.result}>
        <Label>Saldo impian bulan ini</Label>
        <Text style={styles.resultAmount}>{rupiah(balance)}</Text>
        <Text style={styles.resultHint}>
          {rupiah(money)} − {rupiah(expenses)}. Sisa saldo ikut ke bulan depan.
        </Text>
      </Card>

      <View style={onboarding.bottom}>
        <PrimaryButton label="Lanjut" onPress={next} busy={saving} />
        <Text style={onboarding.privacy}>Angka ini cuma disimpan di HP kamu.</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  limit: { ...type.small, marginTop: 10, color: colors.warn, textAlign: 'center' },
  result: { marginTop: 28 },
  resultAmount: { ...type.money, marginTop: 6, color: colors.text },
  resultHint: { ...type.small, marginTop: 4, color: colors.textSoft },
});
