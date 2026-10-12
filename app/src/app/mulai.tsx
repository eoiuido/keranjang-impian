import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { MoneySlider } from '@/components/MoneySlider';
import { Page, PrimaryButton, Steps } from '@/components/ui';
import { draft } from '@/lib/profile';
import { onboarding as styles } from '@/components/onboardingStyles';

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
      <Steps current={1} total={2} />
      <Text style={styles.title}>Uang bulanan kamu berapa?</Text>
      <Text style={styles.sub}>Uang saku atau gaji, kira-kira aja.</Text>

      <View style={styles.why}>
        <Text style={styles.whyText}>
          Biar terasa nyata: kamu belanja pakai uangmu sendiri, bukan uang tak terbatas.
        </Text>
      </View>

      <View style={styles.slider}>
        <MoneySlider
          label="Uang bulanan"
          value={money}
          onChange={setMoney}
          sliderMax={20_000_000}
          max={100_000_000}
        />
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label="Lanjut" onPress={next} disabled={money <= 0} />
        <Text style={styles.privacy}>Angka ini cuma disimpan di HP kamu.</Text>
      </View>
    </Page>
  );
}
