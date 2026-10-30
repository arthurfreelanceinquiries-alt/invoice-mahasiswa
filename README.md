# 📋 Invoice & Payroll Jam Kerja Panitia Mahasiswa (MDL Esports Edition)

> **Sistem Pembuatan Dokumen Invoice & Rekapitulasi Honorarium Panitia Mahasiswa Berbasis Jam Kerja.**  
> Dirancang khusus untuk event **MDL Esports Indonesia** bersama **Universitas Kristen Krida Wacana (UKRIDA)**.  
> Standar A4 Print-Ready, Portabel Tanpa Backend, Dilengkapi Fitur Auto-Save LocalStorage, Quick-Apply Tarif/Jam, & Export/Import JSON.

---

## 🌟 Fitur & Ketentuan Operasional

1. **Perhitungan Berbasis Jam Kerja Akumulatif (Hourly Rate):**
   - **Shift Kerja:** Call crew pukul **10:00 WIB** s.d. Selesai shift pukul **23:00 WIB** (**13 Jam / Hari**).
   - **Periode Kerja:** Rekapitulasi kumulatif **Senin s.d. Senin** (8 hari operasional).
   - **Tanpa Pembagian Harian:** Dokumen langsung menyajikan total akumulasi jam kerja dan gaji kumulatif seluruh panitia selama periode acara sesuai permintaan Pak Hudi.
   - **Tanpa Rembesan Operasional:** Fokus penuh pada tagihan honorarium tenaga kerja mahasiswa.

2. **Daftar Pasukan Mahasiswa UKRIDA (16 Orang Terdata):**
   - **Runner Logistic (5 Orang - 8 Hari / 104 Jam):** Steven Felizio, Nathanael, Nelson Kusuma, Bryan Gandarasa, Siddharta Pratama Budiono (Ketua UKM Esports).
   - **Floor Officer (6 Orang - 8 Hari / 104 Jam):** Robert Paulus Junior Sihite, Andreas Fransisco, Juan Louis, Jericco Wijaya, Varlent Alberta Gunawan, Justin Ansell Wibisono.
   - **Manpower Registration (2 Orang - 8 Hari / 104 Jam):** Chelsea Claudia, Shania Ferliany Wi.
   - **Broadcast Officer (1 Orang - 8 Hari / 104 Jam):** Kristofer Ryan Giggs Eka Saputra.
   - **Usher Awarding (2 Orang - Khusus Day 1 & Day 4 / 26 Jam):** Cristabel Grasilia Angelica, Gaby.

3. **Fitur Interaktif & Efisiensi:**
   - **⚡ Quick-Apply Tarif/Jam:** Masukkan tarif per jam (misal: Rp 25.000/jam) dan klik satu tombol untuk menerapkan ke seluruh panitia secara instan.
   - **Kalkulasi Jam Otomatis:** Perubahan hari kerja atau jam per hari langsung menghitung total jam dan subtotal honor.
   - **Uang Muka / Kasbon (DP):** Opsi pemotongan uang muka jika ada dana talangan awal.
   - **Terbilang Rupiah Otomatis:** Mengonversi total tagihan menjadi teks kalimat resmi Bahasa Indonesia.

4. **Lembar Pengesahan Empat Pihak (4-Way Sign-Off):**
   - **Diajukan Oleh:** Arthur Reezan (Koordinator Pasukan Mahasiswa UKRIDA)
   - **Diverifikasi Oleh:** Sylvia Stevanie (Bendahara Pelaksana)
   - **Disetujui Oleh:** Daniel Hutapea (Kepala Unit Kemahasiswaan UKRIDA)
   - **Diterima & Disahkan Oleh:** Pak Hudi (PIC Acara & Tim Penyelenggara MDL)

5. **Portabilitas & Cetak PDF A4:**
   - **Export / Import JSON:** Simpan konfigurasi ke berkas `.json` lokal dan pulihkan kapan saja.
   - **Auto-Save LocalStorage:** Perubahan tersimpan otomatis di browser tanpa khawatir data hilang saat reload.
   - **Print-to-PDF Presisi:** Desain responsif dengan `@media print` yang menghilangkan tombol kontrol dan menghasilkan dokumen cetak A4 yang rapi dan elegan.

---

## 🚀 Cara Menggunakan

Aplikasi ini berbasis client-side murni (Zero Dependency).

### 1. Buka Langsung di Web (GitHub Pages)
Dokumen live dapat diakses langsung melalui:  
👉 **[https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/](https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/)**

### 2. Jalankan Secara Lokal
```bash
# Clone repositori
git clone https://github.com/arthurfreelanceinquiries-alt/invoice-mahasiswa.git
cd invoice-mahasiswa

# Buka di browser
xdg-open index.html   # Linux
open index.html       # macOS
start index.html      # Windows
```

### 3. Ekspor ke PDF
1. Klik tombol **🖨️ Cetak / PDF (A4)** di pojok kanan atas atau gunakan shortcut `Ctrl + P`.
2. Pilih printer **Save as PDF** dengan kertas ukuran **A4**.
3. Pastikan opsi **Background graphics** dicentang agar estetika tabel dan badge tercetak sempurna.
4. Klik **Save**.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE).
