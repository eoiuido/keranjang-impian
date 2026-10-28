import { H, LegalPage, P } from '@/components/Legal';

// Privacy policy (spec.md section 8, UU PDP). Must stay honest about what is stored where.
export default function Privasi() {
  return (
    <LegalPage title="Kebijakan Privasi" updated="28 Oktober 2026">
      <P>
        Spirit Belongings adalah aplikasi dari EOI. Kebijakan ini menjelaskan data apa yang kami simpan, di mana, dan
        hak kamu atas data itu, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
      </P>

      <H>Data yang hanya ada di HP kamu</H>
      <P>• Uang bulanan dan pengeluaran rutin yang kamu isi.</P>
      <P>• Barang di koleksimu: nama, harga, kategori, tanggal, dan foto atau screenshot (dikecilkan di HP).</P>
      <P>• Alamat yang kamu ketik saat checkout palsu. Alamat tidak pernah dikirim ke server kami.</P>
      <P>Kalau kamu menghapus data browser atau ganti HP tanpa paket berbayar, data ini hilang.</P>

      <H>Data yang kami simpan di server (pengguna berbayar)</H>
      <P>• Email, untuk menyimpan akses dan mengirim kode masuk.</P>
      <P>• Catatan pembayaran: paket, jumlah, tanggal, dan metode bayar (misalnya QRIS atau e-wallet).</P>
      <P>• Masa aktif paketmu.</P>
      <P>
        • Backup angka: uang bulanan, pengeluaran, saldo, hutang simulasi, dan daftar barang (nama, harga, kategori,
        tanggal). Foto dan alamat tidak pernah ikut di-backup.
      </P>
      <P>• Kode masuk 6 angka, disimpan dalam bentuk teracak dan berlaku 10 menit.</P>

      <H>Pembayaran</H>
      <P>
        Pembayaran diproses oleh DOKU. Kami tidak pernah melihat atau menyimpan data kartu, rekening, atau PIN e-wallet
        kamu. Kebijakan privasi DOKU berlaku untuk data yang kamu berikan di halaman pembayaran mereka.
      </P>

      <H>Untuk apa data dipakai</H>
      <P>Hanya untuk menjalankan aplikasi: menyimpan koleksimu, membuka paket berbayar, backup, dan bantuan pelanggan.</P>
      <P>
        Kami bisa memakai alat pengukur (misalnya Meta Pixel dan statistik pemakaian) untuk tahu iklan mana yang
        berhasil. Angka uang, alamat, foto, dan isi koleksimu tidak dikirim ke alat tersebut. Kami tidak menjual data
        kamu.
      </P>

      <H>Berapa lama disimpan</H>
      <P>Backup dan akun disimpan selama akunmu ada. Catatan pembayaran disimpan sesuai kewajiban pembukuan dan pajak.</P>

      <H>Hak kamu</H>
      <P>
        Kamu boleh minta salinan, perbaikan, atau penghapusan data kamu. Cara tercepat: Pengaturan → Hapus semua data.
        Ini menghapus data di HP dan akun, backup, serta login di server. Catatan pembayaran tetap disimpan tanpa email.
        Untuk permintaan lain, email eoi.uido@gmail.com; kami balas dalam 2 hari kerja.
      </P>

      <H>Keamanan</H>
      <P>Semua koneksi memakai HTTPS. Kode masuk dan token login disimpan dalam bentuk teracak.</P>

      <H>Pengguna di bawah 18 tahun</H>
      <P>Kalau kamu di bawah 18 tahun, minta izin orang tua atau wali sebelum membeli paket.</P>

      <H>Perubahan</H>
      <P>Kalau kebijakan ini berubah, kami perbarui halaman ini dan tanggal di atas.</P>

      <H>Privacy Policy (English summary)</H>
      <P>
        Spirit Belongings is an EOI app. Your income and expense numbers, items, photos and address stay on your phone.
        For paid users we store your email, payment records, plan period, and a backup of numbers and item names
        (never photos or address). Payments are processed by DOKU; we never see card, bank or e-wallet details. We may use
        ad-measurement tools without sending money figures, addresses, photos or your collection. We don&apos;t sell
        data. You can delete everything via Settings → Hapus semua data, or email eoi.uido@gmail.com (reply within 2
        working days). Payment records are kept without your email for bookkeeping, as required by law.
      </P>
    </LegalPage>
  );
}
