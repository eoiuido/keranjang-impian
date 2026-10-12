import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Tumbler } from '@/components/Tumbler';
import { colors, maxWidth, radius } from '@/theme';

// S1. Landing: keeps the ad's promise with one headline and one button.
export default function Landing() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
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

        <Link href="/mulai" asChild>
          <Pressable style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>Coba checkout palsu</Text>
          </Pressable>
        </Link>
        <Text style={styles.note}>Gratis 3 kali. Tanpa daftar.</Text>

        <View style={styles.footer}>
          <Link href="/masuk" style={styles.footerLink}>
            Sudah bayar? Masuk
          </Link>
          <Text style={styles.footerSmall}>Privasi · Ketentuan · eoi.uido@gmail.com</Text>
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
  button: {
    marginTop: 32,
    alignSelf: 'stretch',
    backgroundColor: colors.button,
    borderRadius: radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: { color: colors.buttonText, fontSize: 18, fontWeight: '700' },
  note: { marginTop: 10, fontSize: 14, color: colors.textSoft },
  footer: { marginTop: 'auto', paddingTop: 32, alignItems: 'center', gap: 8 },
  footerLink: { fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
  footerSmall: { fontSize: 12, color: colors.textSoft },
});
