import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SkinPicker } from '@/components/SkinPicker';
import { Header, Page, PrimaryButton } from '@/components/ui';
import { readSkin, setSkin } from '@/lib/skin';
import { type SkinName, type } from '@/theme';

// S1b. Pick a skin, once, before the money questions. Can be changed later in Pengaturan.
export default function Gaya() {
  const [skin, set] = useState<SkinName | null>(null);
  useEffect(() => set(readSkin() ?? 'butik'), []);

  const next = () => {
    if (skin) setSkin(skin);
    router.push('/mulai');
  };

  return (
    <Page skin="netral">
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Text style={styles.title}>Pilih gayamu</Text>
      <Text style={styles.sub}>Mau belanja di suasana yang mana?</Text>
      <View style={{ marginTop: 22 }}>
        <SkinPicker value={skin} onChange={set} />
      </View>
      <View style={styles.bottom}>
        <PrimaryButton label="Lanjut" tone="ink" onPress={next} disabled={!skin} />
        <Text style={styles.note}>Bisa diganti kapan saja di Pengaturan.</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { ...type.title, marginTop: 8, color: '#111114' },
  sub: { ...type.body, marginTop: 4, color: '#6B6B73' },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 10 },
  note: { ...type.small, color: '#8A8A92', textAlign: 'center' },
});
