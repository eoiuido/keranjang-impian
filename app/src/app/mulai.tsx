import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { MoneySlider } from '@/components/MoneySlider';
import { onboarding } from '@/components/onboarding';
import { Header, Notice, Page, PrimaryButton, Steps } from '@/components/ui';
import { draft } from '@/lib/profile';

// S2. Onboarding 1: monthly money.
export default function Mulai() {
  const [money, setMoney] = useState(draft.money || 1_500_000);

  const next = () => {
    draft.money = money;
    draft.expenses = Math.min(draft.expenses, money);
    router.push('/pengeluaran');
  };

  return (
    <Page>
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Steps current={1} total={2} />
      <Text style={onboarding.title}>Uang bulanan kamu berapa?</Text>
      <Text style={onboarding.sub}>Uang saku atau gaji, kira-kira aja.</Text>

      <View style={{ marginTop: 20 }}>
        <Notice icon="alert">Biar terasa nyata: kamu belanja pakai uangmu sendiri, bukan uang tak terbatas.</Notice>
      </View>

      <View style={onboarding.slider}>
        <MoneySlider label="Uang bulanan" value={money} onChange={setMoney} sliderMax={20_000_000} max={100_000_000} />
      </View>

      <View style={onboarding.bottom}>
        <PrimaryButton label="Lanjut" onPress={next} disabled={money <= 0} />
        <Text style={onboarding.privacy}>Angka ini cuma disimpan di HP kamu.</Text>
      </View>
    </Page>
  );
}
