import { router, useFocusEffect } from 'expo-router';
import { type ReactNode, useCallback, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { Card, Header, Label, Page } from '@/components/ui';
import { logout } from '@/lib/account';
import { rupiah } from '@/lib/format';
import { type Access, getAccess, PLANS } from '@/lib/plan';
import { getProfile, type Profile } from '@/lib/profile';
import { colors, type } from '@/theme';

const HELP = 'eoi.uido@gmail.com';
const shortDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// S16. Settings: plan, money numbers, help & policies, log out, delete all data.
export default function Pengaturan() {
  const [access, setAccess] = useState<Access | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useFocusEffect(
    useCallback(() => {
      getAccess().then((a) => setAccess(a ?? null));
      getProfile().then((p) => setProfile(p ?? null));
    }, []),
  );

  const paid = !!access && new Date(access.endsAt).getTime() > Date.now();

  const doLogout = async () => {
    await logout();
    setAccess(null);
  };

  return (
    <Page>
      <Header title="Pengaturan" onBack={() => (router.canGoBack() ? router.back() : router.replace('/koleksi'))} />

      <Label style={styles.section}>Paket</Label>
      <Card style={styles.list}>
        {paid && access ? (
          <>
            <Item icon="checkCircle" title={`Paket ${PLANS[access.plan].name}`} note={`Aktif sampai ${shortDate(access.endsAt)}`} first />
            <Item icon="mail" title="Email" note={access.email} />
            <Item icon="back" title="Keluar dari akun" note="Koleksi di HP ini tetap ada" onPress={doLogout} />
          </>
        ) : (
          <>
            <Item icon="sparkle" title="Paket gratis" note="3 checkout palsu" first onPress={() => router.push('/paywall')} />
            <Item icon="lock" title="Sudah bayar? Masuk" note="Pakai email waktu bayar" onPress={() => router.push('/masuk')} />
          </>
        )}
      </Card>

      <Label style={styles.section}>Uang bulanan</Label>
      <Card style={styles.list}>
        <Item
          icon="wallet"
          title={profile ? `${rupiah(profile.money)} · pengeluaran ${rupiah(profile.expenses)}` : 'Belum diisi'}
          note="Ubah uang bulanan & pengeluaran"
          first
          onPress={() => router.push('/uang')}
        />
      </Card>

      <Label style={styles.section}>Bantuan & kebijakan</Label>
      <Card style={styles.list}>
        <Item icon="mail" title="Hubungi kami" note={HELP} first onPress={() => Linking.openURL(`mailto:${HELP}`)} />
        <Item icon="lock" title="Kebijakan privasi" onPress={() => router.push('/privasi')} />
        <Item icon="doc" title="Syarat & ketentuan" onPress={() => router.push('/ketentuan')} />
        <Item icon="card" title="Kebijakan refund" onPress={() => router.push('/refund')} />
      </Card>

      <Label style={styles.section}>Data</Label>
      <Card style={styles.list}>
        <Item icon="alert" title="Hapus semua data" note="Di HP ini dan di server kami" danger first onPress={() => router.push('/hapus')} />
      </Card>

      <Text style={styles.footer}>Spirit Belongings by EOI</Text>
    </Page>
  );
}

function Item({
  icon,
  title,
  note,
  onPress,
  first,
  danger,
}: {
  icon: IconName;
  title: string;
  note?: string;
  onPress?: () => void;
  first?: boolean;
  danger?: boolean;
}) {
  const content: ReactNode = (
    <>
      <Icon name={icon} size={20} color={danger ? colors.warn : colors.text} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, danger && { color: colors.warn }]}>{title}</Text>
        {!!note && <Text style={styles.note}>{note}</Text>}
      </View>
      {onPress && <Icon name="arrowRight" size={16} color={colors.textFaint} />}
    </>
  );
  const style = [styles.item, !first && styles.itemLine];
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [...style, pressed && { backgroundColor: colors.surface }]}>
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 22, marginBottom: 8 },
  list: { padding: 0, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  itemLine: { borderTopWidth: 1, borderTopColor: colors.line },
  title: { ...type.body, fontWeight: '600', color: colors.text },
  note: { ...type.small, color: colors.textSoft },
  footer: { ...type.small, marginTop: 28, color: colors.textFaint, textAlign: 'center' },
});
