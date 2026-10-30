# 📋 Invoice & Payroll Generator Mahasiswa (Event & Organization Edition)

> **Sistem Pembuatan Dokumen Invoice, Honorarium Tim Mahasiswa (NIM), dan Rekapitulasi Reimbursement Operasional.**  
> Siap Cetak PDF Standar A4, Interaktif Tanpa Backend, Dilengkapi Fitur Auto-Save LocalStorage & Export/Import JSON.

---

## 🌟 Fitur Utama

1. **Pemilahan 2 Kluster Akuntansi:**
   - **Kluster 1: Honorarium & Gaji Mahasiswa:** Dilengkapi kolom `Nama Lengkap`, `NIM (Nomor Induk Mahasiswa)`, `Divisi / Peran`, `Durasi/Volume`, dan `Tarif (Rp)`. Sesuai standar administrasi kampus, BEM, kepanitiaan, atau proyek lepas (freelance).
   - **Kluster 2: Penggantian Pengeluaran (Reimbursement / At Cost):** Kolom `Tanggal`, `Nama Barang/Jasa`, `Toko / No. Nota Bukti`, `Qty`, dan `Harga Satuan`.
2. **Kalkulasi & Terbilang Rupiah Otomatis:**
   - Menghitung subtotal honor dan subtotal belanja secara instan (*real-time*).
   - Mendukung input **Uang Muka / Kasbon (DP)** sebagai pengurang tagihan.
   - Mengonversi total angka secara otomatis ke format kalimat terbilang Bahasa Indonesia (contoh: *"Dua Juta Lima Ratus Ribu Rupiah"*).
3. **Penyimpanan Lokal & Portabilitas Data:**
   - **Auto-Save LocalStorage:** Data yang diisi tidak akan hilang saat browser di-refresh atau ditutup.
   - **Export / Import JSON:** Kemudahan menyimpan data per event (misal: *Invoice_MDL.json*, *Invoice_Seminar.json*) dan membukanya kembali kapan saja.
4. **Siap Cetak / Export PDF (Standar A4):**
   - Menggunakan *CSS Print Media Query* yang rapi.
   - Tombol-tombol navigasi dan aksi otomatis disembunyikan saat mencetak.
   - Format input otomatis dikonversi menjadi teks dokumen formal.
5. **Lembar Pengesahan Tiga Pihak (Triple Sign-off):**
   - Kolom tanda tangan formal: **Yang Mengajukan (Koordinator/PIC)**, **Diverifikasi (Bendahara/Pemeriksa)**, dan **Disetujui (Pimpinan/Pemberi Dana)**.

---

## 🚀 Cara Menjalankan

Aplikasi ini berbasis client-side murni (HTML5, Vanilla CSS3, & Modern JS). Tidak memerlukan instalasi server atau dependensi tambahan.

### 1. Jalankan Secara Lokal
Cukup buka file `index.html` dengan browser apa pun (Google Chrome, Firefox, Microsoft Edge, Safari):

```bash
# Di Linux
xdg-open index.html

# Di macOS
open index.html

# Di Windows (Command Prompt / PowerShell)
start index.html
```

### 2. Cetak ke PDF
1. Tekan tombol **🖨️ Cetak / Simpan PDF (A4)** di pojok kanan atas, atau gunakan pintasan keyboard `Ctrl + P` (Windows/Linux) / `Cmd + P` (macOS).
2. Pada dialog print browser:
   - **Destination:** Save as PDF
   - **Paper Size:** A4
   - **Margins:** Default / None
   - **Options:** Centang *"Background graphics"* agar garis dan warna tabel tercetak sempurna.
3. Klik **Save**.

---

## 📦 Struktur Berkas

```text
invoice-mahasiswa/
├── index.html       # Aplikasi utama, kalkulator invoice, dan styling PDF A4
├── README.md        # Panduan penggunaan & dokumentasi teknis
├── LICENSE          # Lisensi open-source (MIT)
└── .gitignore       # Konfigurasi pengabaian file sementara
```

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE). Bebas digunakan, dimodifikasi, dan didistribusikan untuk kepanitiaan mahasiswa, organisasi kampus, maupun proyek komersial.
