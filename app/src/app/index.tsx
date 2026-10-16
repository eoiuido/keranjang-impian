import { Link, router } from 'expo-router';
import Head from 'expo-router/head';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Tumbler } from '@/components/Tumbler';
import { PrimaryButton } from '@/components/ui';
import { getCheckoutCount } from '@/lib/collection';
import { getProfile } from '@/lib/profile';
import { track } from '@/lib/track';
import { colors, maxWidth } from '@/theme';

// S1. Landing: keeps the ad's promise with one headline and one button.
export default function Landing() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Head>
        <title>Keranjang Impian: Checkout palsu. Dompet aman.</title>
      </Head>
      <View style={styles.column}>
        <Text style={styles.brand}>Keranjang Impian</Text>

        <View style={styles.hero}>
          <View style={styles.blob} />
          <Tumbler size={1.1} />
        </View>

        <Text style={styles.headline} role="heading">
          Checkout palsu.{'\n'}Dompet aman.
        </Text>
        <Text style={styles.sub}>Beli barang impianmu tanpa keluar uang beneran.</Text>

        <View style={styles.cta}>
          <PrimaryButton
            label="Coba checkout palsu"
            onPress={async () => {
              track('start_tapped');
              // Returning on this phone: skip what they already did.
              const [profile, count] = await Promise.all([getProfile(), getCheckoutCount()]);
              router.push(count > 0 ? '/koleksi' : profile ? '/barang' : '/mulai');
            }}
          />
        </View>
        <Text style={styles.note}>Gratis 3 kali. Tanpa daftar.</Text>

        <View style={styles.footer}>
          <Link href="/masuk" style={styles.footerLink}>
            Sudah bayar? Masuk
          </Link>
          <Text style={styles.footerSmall}>Keranjang Impian by EOI · Privasi · Ketentuan · eoi.uido@gmail.com</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', backgroundColor: colors.bg, paddingHorizontal: 16 },
  column: { width: '100%', maxWidth, flexGrow: 1, alignItems: 'center', paddingTop: 20, paddingBottom: 24 },
  brand: { fontSize: 16, fontWeight: '700', color: colors.pinkDeep, letterSpacing: 0.5 },
  hero: { marginTop: 24, width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  blob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.butter,
  },
  headline: {
    marginTop: 28,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  sub: { marginTop: 12, fontSize: 17, lineHeight: 24, color: colors.textSoft, textAlign: 'center' },
  cta: { marginTop: 32, alignSelf: 'stretch' },
  note: { marginTop: 10, fontSize: 14, color: colors.textSoft },
  footer: { marginTop: 'auto', paddingTop: 32, alignItems: 'center', gap: 8 },
  footerLink: { fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
  footerSmall: { fontSize: 12, color: colors.textSoft },
});
