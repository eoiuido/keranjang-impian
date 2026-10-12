import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MoneySlider } from '@/components/MoneySlider';
import { Page, PrimaryButton, Steps } from '@/components/ui';
import { rupiah } from '@/lib/format';
import { completeOnboarding, draft } from '@/lib/profile';
import { track } from '@/lib/track';
import { colors, radius } from '@/theme';
import { onboarding as shared } from '@/components/onboardingStyles';

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
      <Steps current={2} total={2} />
      <Text style={shared.title}>Pengeluaran rutin sebulan kira-kira?</Text>
      <Text style={shared.sub}>Makan, transport, kos, pulsa. Satu angka kasar aja.</Text>

      <View style={shared.slider}>
        <MoneySlider
          label="Pengeluaran rutin sebulan"
          value={expenses}
          onChange={setExpenses}
          sliderMax={Math.min(20_000_000, money)}
          max={money}
        />
        {atLimit && <Text style={styles.limit}>Pengeluaran gak bisa lebih dari uang bulanan.</Text>}
      </View>

      <View style={styles.result}>
        <Text style={styles.resultLabel}>Saldo impian bulan ini</Text>
        <Text style={styles.resultAmount}>{rupiah(balance)}</Text>
        <Text style={styles.resultHint}>
          {rupiah(money)} − {rupiah(expenses)}. Sisa saldo bulan ini ikut ke bulan depan.
        </Text>
      </View>

      <View style={shared.bottom}>
        <PrimaryButton label="Lanjut" onPress={next} disabled={saving} />
        <Text style={shared.privacy}>Angka ini cuma disimpan di HP kamu.</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  limit: { marginTop: 10, fontSize: 14, color: colors.pinkDeep, textAlign: 'center' },
  result: {
    marginTop: 28,
    backgroundColor: colors.mint,
    borderRadius: radius.md,
    padding: 18,
    alignItems: 'center',
  },
  resultLabel: { fontSize: 15, color: colors.text },
  resultAmount: { marginTop: 4, fontSize: 30, fontWeight: '800', color: colors.text },
  resultHint: { marginTop: 6, fontSize: 13, color: colors.textSoft, textAlign: 'center' },
});
