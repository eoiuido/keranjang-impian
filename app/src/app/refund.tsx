import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Page } from '@/components/ui';
import { colors } from '@/theme';

// Refund and contact policy (spec.md section 8). Plain words, Indonesian first.
export default function Refund() {
  return (
    <Page>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityRole="button">
        <Text style={styles.back}>‹ Kembali</Text>
      </Pressable>
      <Text style={styles.title}>Kebijakan Refund & Kontak</Text>

      <Text style={styles.h}>Uang kembali kalau:</Text>
      <Text style={styles.p}>• Kamu terpotong dua kali untuk pembayaran yang sama.</Text>
      <Text style={styles.p}>• Jumlah yang terpotong beda dengan harga yang tertulis di layar.</Text>
      <Text style={styles.p}>• Kamu sudah bayar, tapi akses tidak aktif dalam 24 jam dan kami tidak bisa memperbaikinya.</Text>

      <Text style={styles.h}>Cara minta bantuan</Text>
      <Text style={styles.p}>
        Kirim email ke eoi.uido@gmail.com dengan email yang kamu pakai saat bayar dan bukti pembayaran (screenshot).
        Kami balas dalam 2 hari kerja. Refund dikirim ke rekening atau e-wallet yang kamu pakai, maksimal 7 hari kerja
        setelah disetujui.
      </Text>

      <Text style={styles.h}>Yang perlu kamu tahu</Text>
      <Text style={styles.p}>
        • Paket Mingguan (Rp10.000 / 7 hari) dan Tahunan (Rp119.000 / 1 tahun) dibayar sekali, tidak diperpanjang
        otomatis.
      </Text>
      <Text style={styles.p}>
        • Checkout di dalam aplikasi adalah simulasi. Tidak ada uang yang terpotong dan tidak ada barang yang dikirim.
      </Text>

      <Text style={styles.h}>Refund & Contact (English)</Text>
      <Text style={styles.p}>
        We refund double charges, charges that differ from the price shown, or payments where access isn't activated within 24 hours and we can't fix it. Email
        eoi.uido@gmail.com with your payment email and a screenshot of the payment. Plans are one-time payments and never
        renew automatically.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  back: { fontSize: 16, color: colors.textSoft, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 8 },
  h: { marginTop: 18, marginBottom: 6, fontSize: 17, fontWeight: '800', color: colors.text },
  p: { fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 4 },
});
