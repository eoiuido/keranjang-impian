import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { field, Header, Label, Page, PrimaryButton, TextButton, Display } from '@/components/ui';
import { syncBackup } from '@/lib/backup';
import { MAX_PRICE } from '@/lib/cart';
import { GOAL_TYPES, type GoalTypeId, getGoal, saveGoal } from '@/lib/goal';
import { isPaid } from '@/lib/plan';
import { colors, radius, type } from '@/theme';

const idr = new Intl.NumberFormat('id-ID');
const MIN_TARGET = 100_000;
const DEFAULT_NAME: Record<GoalTypeId, string> = { laptop: 'Laptop impian', phone: 'HP baru', travel: 'Liburan', other: 'Target impian' };

// Savings goal (paid): what the saved money is building toward.
export default function Target() {
  const [goalType, setGoalType] = useState<GoalTypeId>('laptop');
  const [name, setName] = useState('');
  const [target, setTarget] = useState(0);
  const [hasGoal, setHasGoal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    isPaid().then((p) => !p && router.replace('/paywall'));
    getGoal().then((g) => {
      if (!g) return;
      setHasGoal(true);
      setGoalType(g.type);
      setName(g.name);
      setTarget(g.target);
    });
  }, []);

  const ok = target >= MIN_TARGET;

  const save = async () => {
    setSaving(true);
    await saveGoal({ type: goalType, name: name.trim() || DEFAULT_NAME[goalType], target });
    syncBackup();
    router.replace('/koleksi');
  };

  const remove = async () => {
    await saveGoal(null);
    syncBackup();
    router.replace('/koleksi');
  };

  return (
    <Page>
      <Header title="Target tabungan" onBack={() => (router.canGoBack() ? router.back() : router.replace('/koleksi'))} />
      <Display style={styles.title}>Uang yang kamu selamatkan mau dipakai buat apa?</Display>
      <Text style={styles.sub}>Setiap checkout palsu menambah progres ke target ini.</Text>

      <Label style={styles.label}>Jenis</Label>
      <View style={styles.types}>
        {GOAL_TYPES.map((t) => {
          const on = t.id === goalType;
          return (
            <Pressable key={t.id} onPress={() => setGoalType(t.id)} accessibilityRole="radio" accessibilityState={{ checked: on }} style={[styles.type, on && styles.typeOn]}>
              <Icon name={t.icon} size={26} color={on ? colors.white : colors.text} strokeWidth={1.6} />
              <Text style={[styles.typeText, on && { color: colors.white }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Label style={styles.label}>Nama target</Label>
      <TextInput
        style={field}
        value={name}
        onChangeText={setName}
        placeholder={DEFAULT_NAME[goalType]}
        placeholderTextColor={colors.textFaint}
        maxLength={40}
        accessibilityLabel="Nama target"
      />

      <Label style={styles.label}>Harga target</Label>
      <View style={styles.priceField}>
        <Text style={styles.rp}>Rp</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          inputMode="numeric"
          value={target ? idr.format(target) : ''}
          onChangeText={(t) => setTarget(Math.min(MAX_PRICE, Number(t.replace(/\D/g, '')) || 0))}
          accessibilityLabel="Harga target"
        />
      </View>
      {target > 0 && !ok && <Text style={styles.error}>Target minimal Rp100.000.</Text>}

      <View style={styles.bottom}>
        <PrimaryButton label={ok ? 'Simpan target' : 'Isi harga target dulu'} onPress={save} disabled={!ok} busy={saving} />
        {hasGoal && <TextButton label="Hapus target" onPress={remove} />}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { ...type.title, fontSize: 24, lineHeight: 30, color: colors.text },
  sub: { ...type.body, marginTop: 6, color: colors.textSoft },
  label: { marginTop: 24, marginBottom: 8 },
  types: { flexDirection: 'row', gap: 8 },
  type: { flex: 1, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingVertical: 14 },
  typeOn: { backgroundColor: colors.text, borderColor: colors.text },
  typeText: { fontSize: 13, fontWeight: '600', color: colors.text },
  priceField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: 14 },
  rp: { fontSize: 20, fontWeight: '700', color: colors.textSoft, marginRight: 6 },
  priceInput: { flex: 1, paddingVertical: 12, fontSize: 22, fontWeight: '800', color: colors.text },
  error: { ...type.small, marginTop: 8, color: colors.warn },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 8 },
});
