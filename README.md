# SPMB SMK Lentera Bangsa 2 - Sistem Penerimaan Murid Baru Online

Aplikasi web modern untuk Sistem Penerimaan Murid Baru (SPMB) SMK Lentera Bangsa 2 Tahun Ajaran 2026/2027.

## Fitur Utama

- **Pendaftaran Mandiri Siswa Baru**: Formulir multi-tahap lengkap (Data Calon Siswa, Data Orang Tua/Wali, Asal Sekolah, Pilihan Kompetensi Keahlian / Jurusan).
- **Cek Status & Verifikasi Berkas**: Pencarian status pendaftaran via Nomor Pendaftaran atau NIK/NISN.
- **Cetak Bukti Pendaftaran Presisi A4**: Template resmi kartu bukti pendaftaran PDF/Print siap cetak ukuran standar A4 lengkap dengan barcode/QR verifikasi.
- **Formulir Kosong Siap Cetak (Blank Form)**: Format formulir fisik A4 untuk pendaftaran luring/offline di posko sekolah.
- **Rekapitulasi Data Pendaftar**: Ekspor dan cetak rekap data pendaftar per gelombang atau per jurusan.
- **Panel Administrasi Terpadu**: Manajemen pendaftar, approval/verifikasi status, manajemen gelombang, manajemen jurusan/kuota, dan log aktivitas.
- **Sinkronisasi Supabase Real-Time & Offline Storage**: Dukungan sinkronisasi data online instan ke Supabase PostgreSQL serta fallback local storage cache.

## Teknologi

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Database / Real-Time**: Supabase Client (PostgreSQL + Realtime WebSockets) / LocalStorage Fallback
- **Ekspor & Cetak**: Cetak CSS Presisi A4, XLSX Spreadsheet Export, Canvas Confetti

## Menjalankan Aplikasi Secara Lokal

1. Instal dependensi:
   ```bash
   npm install
   ```

2. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://0.0.0.0:3000`.

3. Variabel Lingkungan (Opsional):
   Salin `.env.example` ke `.env` dan masukkan kredensial Supabase jika menggunakan instance sendiri:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
