import { Link, router } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Brand, Page, PrimaryButton, Display } from '@/components/ui';
import { getCheckoutCount } from '@/lib/collection';
import { getProfile } from '@/lib/profile';
import { track } from '@/lib/track';
import { colors, radius, type } from '@/theme';

// S1. Landing: keeps the ad's promise with one headline and one button.
export default function Landing() {
  const start = async () => {
    track('start_tapped');
    // Returning on this phone: skip what they already did.
    const [profile, count] = await Promise.all([getProfile(), getCheckoutCount()]);
    router.push(count > 0 ? '/koleksi' : profile ? '/barang' : '/gaya');
  };

  return (
    <Page>
      <Head>
        <title>Spirit Belongings: Checkout palsu. Dompet aman.</title>
      </Head>
      <Brand />

      <View style={styles.hero}>
        <Icon name="tumbler" size={96} color={colors.textFaint} strokeWidth={1.1} />
        <View style={styles.chip}>
          <Icon name="checkCircle" size={16} color={colors.accent} strokeWidth={2} />
          <Text style={styles.chipText}>Rp850.000 diselamatkan</Text>
        </View>
      </View>

      <Display style={styles.headline} role="heading">
        Checkout palsu.{'\n'}Dompet aman.
      </Display>
      <Text style={styles.sub}>Beli barang impianmu tanpa keluar uang beneran, dan lihat tabunganmu bertambah.</Text>

      <View style={styles.cta}>
        <PrimaryButton label="Coba checkout palsu" onPress={start} />
        <Text style={styles.note}>Gratis 3 kali · Tanpa daftar</Text>
      </View>

      <View style={styles.footer}>
        <Link href="/masuk" style={styles.footerLink}>
          Sudah bayar? Masuk
        </Link>
        <Text style={styles.footerSmall}>
          Spirit Belongings by EOI ·{' '}
          <Text style={styles.footerSmallLink} onPress={() => router.push('/privasi')}>
            Privasi
          </Text>
          {' · '}
          <Text style={styles.footerSmallLink} onPress={() => router.push('/ketentuan')}>
            Ketentuan
          </Text>
          {' · '}
          <Text style={styles.footerSmallLink} onPress={() => router.push('/refund')}>
            Refund
          </Text>
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 20,
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  headline: { ...type.hero, marginTop: 28, color: colors.text },
  sub: { ...type.body, fontSize: 16, lineHeight: 24, marginTop: 10, color: colors.textSoft },
  cta: { marginTop: 28, gap: 10 },
  note: { ...type.small, color: colors.textSoft, textAlign: 'center' },
  footer: { marginTop: 'auto', paddingTop: 36, alignItems: 'center', gap: 8 },
  footerLink: { fontSize: 14, fontWeight: '600', color: colors.text, textDecorationLine: 'underline' },
  footerSmallLink: { textDecorationLine: 'underline' },
  footerSmall: { ...type.small, fontSize: 12, color: colors.textFaint, textAlign: 'center' },
});
