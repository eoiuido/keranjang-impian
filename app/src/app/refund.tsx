import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Header, Page, Display } from '@/components/ui';
import { colors, type } from '@/theme';

// Refund and contact policy (spec.md section 8). Plain words, Indonesian first.
export default function Refund() {
  return (
    <Page>
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Display style={styles.title}>Kebijakan Refund & Kontak</Display>

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
  title: { ...type.title, color: colors.text, marginBottom: 8 },
  h: { ...type.h2, fontSize: 16, marginTop: 22, marginBottom: 6, color: colors.text },
  p: { ...type.body, color: colors.textSoft, marginBottom: 4 },
});
