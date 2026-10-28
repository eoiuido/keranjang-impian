import { H, LegalPage, P } from '@/components/Legal';

// Terms of use (spec.md section 8). Plain words, Indonesian first.
export default function Ketentuan() {
  return (
    <LegalPage title="Syarat & Ketentuan" updated="28 Oktober 2026">
      <P>Dengan memakai Spirit Belongings (aplikasi dari EOI), kamu setuju dengan ketentuan berikut.</P>

      <H>Apa aplikasi ini</H>
      <P>
        Spirit Belongings adalah simulasi belanja. Checkout, QRIS &quot;PALSU&quot;, dan saldo di dalam aplikasi tidak
        memakai uang asli, tidak ada barang yang dikirim, dan tidak terhubung dengan toko, bank, atau penyedia pembayaran
        mana pun.
      </P>
      <P>
        Fitur hutang adalah simulasi untuk menunjukkan biaya paylater. Ini bukan pinjaman dan bukan nasihat keuangan.
        Keputusan keuangan tetap tanggung jawab kamu.
      </P>

      <H>Paket berbayar</H>
      <P>
        Paket Mingguan (Rp10.000 / 7 hari) dan Tahunan (Rp119.000 / 1 tahun) dibayar sekali lewat DOKU (QRIS atau
        e-wallet) dan tidak diperpanjang otomatis. Kalau kamu bayar lagi sebelum masa aktif habis, waktunya ditambahkan.
        Akses aktif setelah pembayaranmu dikonfirmasi oleh DOKU.
      </P>
      <P>Pengembalian dana mengikuti Kebijakan Refund.</P>

      <H>Akun</H>
      <P>
        Akses berbayar terhubung ke email yang kamu pakai saat bayar. Jaga kode masuk kamu dan jangan bagikan ke orang
        lain. Kamu bisa menghapus akun kapan saja lewat Pengaturan.
      </P>

      <H>Pemakaian yang tidak boleh</H>
      <P>
        Jangan mencoba merusak, membobol, atau menyalahgunakan aplikasi atau sistem pembayarannya. Kami boleh menutup
        akses yang dipakai untuk penipuan.
      </P>

      <H>Batas tanggung jawab</H>
      <P>
        Aplikasi disediakan apa adanya. Kami berusaha agar selalu berjalan baik, tapi tidak menjamin bebas gangguan.
        Tanggung jawab kami paling banyak sebesar jumlah yang kamu bayar untuk paket yang sedang aktif.
      </P>

      <H>Hukum yang berlaku</H>
      <P>Ketentuan ini mengikuti hukum Republik Indonesia.</P>

      <H>Kontak</H>
      <P>Pertanyaan atau keluhan: eoi.uido@gmail.com. Kami balas dalam 2 hari kerja.</P>

      <H>Terms (English summary)</H>
      <P>
        Spirit Belongings is a shopping simulation by EOI: in-app checkouts use no real money, ship nothing, and are not
        linked to any shop, bank or payment provider. The hutang feature is a simulation, not a loan or financial advice.
        Paid plans (weekly Rp10.000 / 7 days, yearly Rp119.000 / 1 year) are one-time payments via DOKU and never renew
        automatically; refunds follow the Refund Policy. Don&apos;t misuse the app. It is provided as is; our liability is
        limited to what you paid for your current plan. Indonesian law applies. Contact: eoi.uido@gmail.com.
      </P>
    </LegalPage>
  );
}
