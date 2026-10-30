# 📋 Invoice & Payroll Jam Kerja Panitia Mahasiswa (MDL Esports Edition)

> **Sistem Pembuatan Dokumen Invoice & Rekapitulasi Honorarium Panitia Mahasiswa Berbasis Jam Kerja.**  
> Dirancang khusus untuk event **MDL Esports Indonesia** bersama **Universitas Kristen Krida Wacana (UKRIDA)**.  
> Standar A4 Print-Ready, Portabel Tanpa Backend, Dilengkapi Fitur Auto-Save LocalStorage, Quick-Apply Tarif/Jam, Slip Individu Transparansi Mahasiswa, & Export/Import JSON.

---

## 🌟 2 Modul Utama Dokumen

Proyek ini menyediakan 2 halaman dokumen yang terintegrasi langsung:

### 1. 📄 Invoice Master & Rekapitulasi Kumulatif (`index.html`)
*Ditujukan untuk Pak Hudi & Tim Manajemen Penyelenggara MDL Esports:*
- **Rekapitulasi Total Kumulatif:** Menyajikan total tagihan seluruh pasukan mahasiswa selama periode **Senin s.d. Senin** (8 hari operasional) tanpa rincian invoice harian terpisah.
- **Tanpa Rembesan Operasional:** Dokumen fokus murni pada honorarium jasa tenaga kerja panitia.
- **Tanda Tangan 4 Pihak:**
  - Diajukan: Arthur Reezan (Koordinator Mahasiswa UKRIDA)
  - Diverifikasi: Sylvia Stevanie (Bendahara Pelaksana)
  - Disetujui: Daniel Hutapea (Kepala Unit Kemahasiswaan UKRIDA)
  - Diterima / Disahkan: Pak Hudi (PIC Acara & Tim MDL Esports Indonesia)

### 2. 🧾 Slip Rincian & Transparansi Jam Kerja Mahasiswa (`slip.html`)
*Ditujukan untuk masing-masing mahasiswa (16 Orang) sebagai bukti transparansi & rincian penerimaan honor:*
- **Rumus Dasar Penggajian:** 
  $$\text{Tarif Dasar} = \text{Rp } 150.000 \text{ / Hari (11 Jam Kerja Efektif)}$$
  $$\text{Tarif per Jam} = \frac{\text{Rp } 150.000}{11 \text{ Jam}} \approx \text{Rp } 13.636,36 \text{ / Jam}$$
- **Potongan Keterlambatan Presisi:** Jika mahasiswa terlambat atau pulang lebih awal, honor dihitung proporsional sesuai jam kerja aktual ($\text{Jam Kerja} \times \text{Tarif per Jam}$), dan jam potongan ditampilkan secara transparan.
- **Timesheet Harian Day 1 s.d. Day 8:** Rincian status kehadiran harian, jam shift, jam kerja aktual, jam potongan terlambat, dan catatan khusus.
- **Selector Mahasiswa Instan:** Dropdown memilih 16 panitia (Logistic, Floor, Registration, Broadcast, Usher) dengan auto-fill NIM, jobdesk, dan riwayat jam.
- **Lembar Tanda Terima 3 Pihak:**
  - Dibuat Oleh: Arthur Reezan (Koordinator)
  - Diverifikasi: Sylvia Stevanie (Bendahara)
  - Diterima Oleh: Mahasiswa yang Bersangkutan (Bukti Tanda Terima)

---

## 👥 Data Pasukan Mahasiswa UKRIDA (16 Orang)

1. **Runner Logistic (5 Orang - 8 Hari / 88 Jam Efektif):**
   - Steven Felizio (NIM: 412023011)
   - Nathanael (NIM: 422026010)
   - Nelson Kusuma (NIM: 412023008)
   - Bryan Gandarasa (NIM: 412023005)
   - Siddharta Pratama Budiono (NIM: 312023017, Ketua UKM Esports)

2. **Floor Officer (6 Orang - 8 Hari / 88 Jam Efektif):**
   - Robert Paulus Junior Sihite (NIM: 412023007)
   - Andreas Fransisco (NIM: 412023009)
   - Juan Louis (NIM: 322025002)
   - Jericco Wijaya (NIM: 322025039)
   - Varlent Alberta Gunawan (NIM: 422023028)
   - Justin Ansell Wibisono (NIM: 322025038)

3. **Manpower Registration (2 Orang - 8 Hari / 88 Jam Efektif):**
   - Chelsea Claudia (NIM: 312026017)
   - Shania Ferliany Wi (NIM: 312025042)

4. **Broadcast Officer (1 Orang - 8 Hari / 88 Jam Efektif):**
   - Kristofer Ryan Giggs Eka Saputra (NIM: 412024005)

5. **Usher Awarding (2 Orang - Khusus Day 1 & Day 4 / 22 Jam Efektif):**
   - Cristabel Grasilia Angelica (NIM: 422026008)
   - Gaby (NIM: Menunggu Konfirmasi)

---

## 🚀 Akses & Penggunaan

### 1. Buka Langsung di Web (GitHub Pages)
- **Invoice Master (Pak Hudi):**  
  👉 **[https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/](https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/)**
- **Slip Rincian Mahasiswa (Per Orang):**  
  👉 **[https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/slip.html](https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/slip.html)**

### 2. Ekspor ke PDF / Cetak
1. Klik tombol **🖨️ Cetak / PDF (A4)** di pojok kanan atas atau gunakan shortcut `Ctrl + P`.
2. Pilih printer **Save as PDF** dengan kertas ukuran **A4**.
3. Pastikan opsi **Background graphics** dicentang agar estetika tabel dan badge tercetak sempurna.
4. Klik **Save**.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE).
