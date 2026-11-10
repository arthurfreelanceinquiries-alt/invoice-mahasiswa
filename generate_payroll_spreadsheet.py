#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_payroll_spreadsheet.py
===============================
Membuat Rekapitulasi Honorarium dan Distribusi Pembayaran Crew UKRIDA
MDL ID Season 14 Playoff dalam format Microsoft Excel (.xlsx) dan Google Sheets ready.

REVISI KHUSUS (Data Sanitized):
1. Gaji Rizky Ramadhan dari Senin-Rabu full dialihkan dan diterima Nico Fernando (3 hari x Rp 150.000 = Rp 450.000).
   Rizky bertugas 4 hari (Kamis-Minggu). Nico bertugas 7 hari (4 hari Broadcast + 3 hari Logistic).
2. Gaji Rizky Ramadhan berkurang 2 jam karena ada telat (masuk Kas UKM Esports).
3. Gaji Budi Santoso berkurang 2 jam (1 jam interview BEM FTC + 1 jam telat).
4. Gaji Dimas Pratama berkurang 1 jam (telat di hari Senin).
5. Gaji Candra Wijaya berkurang 1 jam (telat di hari Senin).
6. Gaji Kevin Adriansyah berkurang 1 jam (telat).
7. Seluruh denda keterlambatan (Total 7 Jam = Rp 95.455) dialokasikan masuk ke KAS UKM ESPORTS UKRIDA!
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def build_payroll_excel(output_file: str):
    wb = openpyxl.Workbook()
    
    # -------------------------------------------------------------
    # TEMA VISUAL & TIPOGRAFI ($30k SaaS Quality)
    # -------------------------------------------------------------
    font_main = "Segoe UI"
    
    title_font = Font(name=font_main, size=15, bold=True, color="0F172A")
    meta_font = Font(name=font_main, size=10, italic=True, color="475569")
    section_font = Font(name=font_main, size=11, bold=True, color="0F172A")
    
    header_font = Font(name=font_main, size=10, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid") # Deep Slate Navy
    
    total_font = Font(name=font_main, size=10, bold=True, color="0F172A")
    total_fill = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid") # Soft Gray Total
    
    kas_fill = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid") # Mint Green Accent
    kas_font = Font(name=font_main, size=10, bold=True, color="065F46")
    
    data_font = Font(name=font_main, size=10, color="1E293B")
    data_font_bold = Font(name=font_main, size=10, bold=True, color="1E293B")
    link_font = Font(name=font_main, size=10, color="0284C7", underline="single") # Sky Blue link
    
    zebra_even = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    zebra_odd = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    
    status_pending_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # Soft Yellow
    status_pending_font = Font(name=font_main, size=9, bold=True, color="92400E")
    
    border_gray = Side(border_style="thin", color="CBD5E1")
    grid_border = Border(left=border_gray, right=border_gray, top=border_gray, bottom=border_gray)
    
    double_bottom = Side(border_style="double", color="0F172A")
    thick_top = Side(border_style="thin", color="0F172A")
    grand_total_border = Border(top=thick_top, bottom=double_bottom, left=border_gray, right=border_gray)

    rupiah_fmt = '"Rp "#,##0'

    # -------------------------------------------------------------
    # SHEET 1: DAFTAR HONORARIUM & DISTRIBUSI TRANSFER
    # -------------------------------------------------------------
    ws1 = wb.active
    ws1.title = "Data_Honorarium_Crew"
    ws1.views.sheetView[0].showGridLines = True

    # Header Judul
    ws1["A1"] = "REKAPITULASI HONORARIUM & DISTRIBUSI TRANSFER CREW UKRIDA"
    ws1["A1"].font = title_font
    
    ws1["A2"] = "Event: Mobile Legends Development League (MDL) ID Season 14 Playoff | UKM Esports & Seni UKRIDA"
    ws1["A2"].font = meta_font

    ws1["A3"] = "Standar Operasional: Rp 150.000 / Hari (11 Jam Kerja) | Denda Keterlambatan: Rp 13.636 / Jam (Dialokasikan ke Kas UKM Esports)"
    ws1["A3"].font = meta_font

    headers = [
        "No",
        "Divisi Penugasan",
        "Nama Lengkap",
        "NIM Mahasiswa",
        "No. WhatsApp / HP",
        "Metode Pembayaran",
        "No. Rekening / No. E-Wallet",
        "Atas Nama (A.N)",
        "Durasi Kerja (Hari)",
        "Honor / Hari (Rp)",
        "Total Bruto (Rp)",
        "Jam Telat (Jam)",
        "Denda Masuk Kas (Rp)",
        "Total Bersih Ditransfer (Rp)",
        "Status Pembayaran",
        "Link Invoice / Slip Online",
        "Link Bukti Transfer (Drive/File)",
        "Catatan Penugasan & Keterlambatan"
    ]

    header_row = 5
    for col_idx, h in enumerate(headers, 1):
        cell = ws1.cell(row=header_row, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = grid_border
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    ws1.row_dimensions[header_row].height = 28

    # DATA 32 PERSONIL (Sanitized Dummy Data)
    crew = [
        # --- 1. LOGISTIC (5 Orang) ---
        {
            "id": 1, "div": "Logistic", "name": "Dimas Pratama", "nim": "412023001", "hp": "081200000001",
            "method": "BCA", "acc": "1000000001", "owner": "Dimas Pratama",
            "days": 7, "rate": 150000, "late_hours": 1, "status": "Pending",
            "notes": "Telat 1 jam di hari Senin (Denda Rp 13.636 dialokasikan ke Kas UKM Esports)"
        },
        {
            "id": 2, "div": "Logistic", "name": "Budi Santoso", "nim": "412023002", "hp": "081200000002",
            "method": "GoPay", "acc": "081200000002", "owner": "Budi Santoso",
            "days": 7, "rate": 150000, "late_hours": 2, "status": "Pending",
            "notes": "Kurang 2 jam (1 jam interview BEM FTC + 1 jam telat, denda Rp 27.273 masuk Kas UKM Esports)"
        },
        {
            "id": 3, "div": "Logistic", "name": "Candra Wijaya", "nim": "412023003", "hp": "081200000003",
            "method": "GoPay", "acc": "081200000003", "owner": "Candra Wijaya",
            "days": 7, "rate": 150000, "late_hours": 1, "status": "Pending",
            "notes": "Telat 1 jam di hari Senin (Denda Rp 13.636 dialokasikan ke Kas UKM Esports)"
        },
        {
            "id": 4, "div": "Logistic", "name": "Kevin Adriansyah", "nim": "412023004", "hp": "081200000004",
            "method": "BCA", "acc": "1000000004", "owner": "Kevin Adriansyah",
            "days": 7, "rate": 150000, "late_hours": 1, "status": "Pending",
            "notes": "Telat 1 jam (Denda Rp 13.636 dialokasikan ke Kas UKM Esports)"
        },
        {
            "id": 5, "div": "Logistic", "name": "Rizky Ramadhan", "nim": "412023005", "hp": "081200000005",
            "method": "BCA", "acc": "1000000005", "owner": "Rizky Ramadhan",
            "days": 4, "rate": 150000, "late_hours": 2, "status": "Pending",
            "notes": "Senin-Rabu (3 hari) full dialihkan ke Nico Fernando. Hadir 4 hari (Kamis-Minggu) telat 2 jam (denda Rp 27.273 masuk Kas Esports)"
        },

        # --- 2. FLOOR OFFICER (6 Orang) ---
        {
            "id": 6, "div": "Floor Officer", "name": "Fajar Hidayat", "nim": "412023006", "hp": "081200000006",
            "method": "BCA", "acc": "1000000006", "owner": "Fajar Hidayat",
            "days": 5, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Rabu s.d Minggu (5 hari kerja penuh)"
        },
        {
            "id": 7, "div": "Floor Officer", "name": "Gilang Perdana", "nim": "412023007", "hp": "081200000007",
            "method": "BCA", "acc": "1000000007", "owner": "Gilang Perdana",
            "days": 5, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Rabu s.d Minggu (5 hari kerja penuh)"
        },
        {
            "id": 8, "div": "Floor Officer", "name": "Hendra Gunawan", "nim": "412023008", "hp": "081200000008",
            "method": "SeaBank", "acc": "1000000008", "owner": "Hendra Gunawan",
            "days": 5, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Rabu s.d Minggu (5 hari kerja penuh)"
        },
        {
            "id": 9, "div": "Floor Officer", "name": "Irfan Maulana", "nim": "412023009", "hp": "081200000009",
            "method": "BCA", "acc": "1000000009", "owner": "Irfan Maulana",
            "days": 5, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Rabu s.d Minggu (5 hari kerja penuh)"
        },
        {
            "id": 10, "div": "Floor Officer", "name": "Joko Susilo", "nim": "412023010", "hp": "081200000010",
            "method": "BCA", "acc": "1000000010", "owner": "Joko Susilo",
            "days": 5, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Rabu s.d Minggu (5 hari kerja penuh)"
        },
        {
            "id": 11, "div": "Floor Officer", "name": "Aditya Pratama", "nim": "412023011", "hp": "081200000011",
            "method": "BCA", "acc": "1000000011", "owner": "Aditya Pratama",
            "days": 5, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Rabu s.d Minggu (5 hari kerja penuh)"
        },

        # --- 3. MANPOWER REGISTRATION (2 Orang) ---
        {
            "id": 12, "div": "Registration", "name": "Larasati Putri", "nim": "412023012", "hp": "081200000012",
            "method": "GoPay", "acc": "081200000012", "owner": "Larasati Putri",
            "days": 4, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Kamis s.d Minggu (4 hari kerja penuh)"
        },
        {
            "id": 13, "div": "Registration", "name": "Maya Anggraini", "nim": "412023013", "hp": "081200000013",
            "method": "BCA", "acc": "1000000013", "owner": "Maya Anggraini",
            "days": 4, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Kamis s.d Minggu (4 hari kerja penuh)"
        },

        # --- 4. BROADCAST OFFICER (1 Orang) ---
        {
            "id": 14, "div": "Broadcast Officer", "name": "Nico Fernando", "nim": "412023014", "hp": "081200000014",
            "method": "BCA", "acc": "1000000014", "owner": "Nico Fernando",
            "days": 7, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Broadcast Utama 4 hari (Kamis-Minggu) + Gaji Penuh Pengganti Rizky Ramadhan 3 hari (Senin-Rabu) = Total 7 Hari Penuh"
        },

        # --- 5. USHER AWARDING (2 Orang) ---
        {
            "id": 15, "div": "Usher Awarding", "name": "Olivia Amanda", "nim": "412023015", "hp": "081200000015",
            "method": "BCA", "acc": "1000000015", "owner": "Olivia Amanda",
            "days": 2, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Day 1 (Pembukaan) & Day 4 (Awarding)"
        },
        {
            "id": 16, "div": "Usher Awarding", "name": "Putri Wulandari", "nim": "412023016", "hp": "081200000016",
            "method": "GoPay", "acc": "081200000016", "owner": "Putri Wulandari",
            "days": 2, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Day 1 (Pembukaan) & Day 4 (Awarding)"
        },

        # --- 6. ANGGOTA SAMAN / TARI TRADISIONAL (7 Orang) ---
        {
            "id": 17, "div": "UKM Tari Tradisional", "name": "Rina Novita", "nim": "-", "hp": "081200000017",
            "method": "BTN", "acc": "1000000017", "owner": "Rina Novita",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Performance Tari Saman Opening Ceremony"
        },
        {
            "id": 18, "div": "UKM Tari Tradisional", "name": "Sari Indah", "nim": "-", "hp": "081200000018",
            "method": "BCA", "acc": "1000000018", "owner": "Sari Indah",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Performance Tari Saman Opening Ceremony"
        },
        {
            "id": 19, "div": "UKM Tari Tradisional", "name": "Tiara Melati", "nim": "-", "hp": "081200000019",
            "method": "BCA", "acc": "1000000019", "owner": "Tiara Melati",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Performance Tari Saman Opening Ceremony"
        },
        {
            "id": 20, "div": "UKM Tari Tradisional", "name": "Ulfa Permata", "nim": "-", "hp": "081200000020",
            "method": "SeaBank", "acc": "1000000020", "owner": "Ulfa Permata",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Performance Tari Saman Opening Ceremony"
        },
        {
            "id": 21, "div": "UKM Tari Tradisional", "name": "Vina Lestari", "nim": "-", "hp": "081200000021",
            "method": "BRI", "acc": "1000000021", "owner": "Vina Lestari",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Performance Tari Saman Opening Ceremony"
        },
        {
            "id": 22, "div": "UKM Tari Tradisional", "name": "Wulan Septiani", "nim": "-", "hp": "081200000022",
            "method": "BCA", "acc": "1000000022", "owner": "Wulan Septiani",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Performance Tari Saman Opening Ceremony"
        },
        {
            "id": 23, "div": "UKM Tari Tradisional", "name": "Yulia Ananda", "nim": "-", "hp": "081200000023",
            "method": "SeaBank", "acc": "1000000023", "owner": "Yulia Ananda",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Performance Tari Saman Opening Ceremony"
        },

        # --- 7. UKM MODERN DANCE (4 Orang) ---
        {
            "id": 24, "div": "UKM Modern Dance", "name": "Zahra Amelia", "nim": "-", "hp": "081200000024",
            "method": "BCA", "acc": "1000000024", "owner": "Zahra Amelia",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Special Performance Modern Dance Day 3"
        },
        {
            "id": 25, "div": "UKM Modern Dance", "name": "Amanda Clarissa", "nim": "-", "hp": "081200000025",
            "method": "BCA", "acc": "1000000025", "owner": "Amanda Clarissa",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Special Performance Modern Dance Day 3"
        },
        {
            "id": 26, "div": "UKM Modern Dance", "name": "Bella Natalie", "nim": "-", "hp": "081200000026",
            "method": "BCA", "acc": "1000000026", "owner": "Bella Natalie",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Special Performance Modern Dance Day 3"
        },
        {
            "id": 27, "div": "UKM Modern Dance", "name": "Cynthia Felicia", "nim": "-", "hp": "081200000027",
            "method": "BCA", "acc": "1000000027", "owner": "Cynthia Felicia",
            "days": 1, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Special Performance Modern Dance Day 3"
        },

        # --- 8. MARKETING & SOCIAL MEDIA (5 Orang) ---
        {
            "id": 28, "div": "Marketing / Socmed", "name": "Daniel Pratama", "nim": "-", "hp": "081200000028",
            "method": "Konfirmasi", "acc": "1000000028", "owner": "Daniel Pratama",
            "days": 4, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Publikasi, Dokumentasi & Media Handling"
        },
        {
            "id": 29, "div": "Marketing / Socmed", "name": "Erwin Santoso", "nim": "-", "hp": "081200000029",
            "method": "Konfirmasi", "acc": "1000000029", "owner": "Erwin Santoso",
            "days": 4, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Publikasi, Dokumentasi & Media Handling"
        },
        {
            "id": 30, "div": "Marketing / Socmed", "name": "Farhan Ramadhan", "nim": "-", "hp": "081200000030",
            "method": "Konfirmasi", "acc": "1000000030", "owner": "Farhan Ramadhan",
            "days": 4, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Publikasi, Dokumentasi & Media Handling"
        },
        {
            "id": 31, "div": "Marketing / Socmed", "name": "Gita Cahyani, S.Kom", "nim": "-", "hp": "081200000031",
            "method": "Konfirmasi", "acc": "1000000031", "owner": "Gita Cahyani, S.Kom",
            "days": 4, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Supervisor & Strategic Media Officer"
        },
        {
            "id": 32, "div": "Marketing / Socmed", "name": "Hadi Kusuma, S.I.Kom", "nim": "-", "hp": "081200000032",
            "method": "Konfirmasi", "acc": "1000000032", "owner": "Hadi Kusuma, S.I.Kom",
            "days": 4, "rate": 150000, "late_hours": 0, "status": "Pending",
            "notes": "Supervisor & Strategic Media Officer"
        }
    ]
    start_data_row = 6

    for idx, c in enumerate(crew, 1):
        curr_row = header_row + idx
        fill_to_use = zebra_even if idx % 2 == 0 else zebra_odd
        
        # Formula HYPERLINK Slip Online (Kompatibel Google Sheets & Excel)
        slip_url = f"https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/slip.html?id={c['id']}"
        slip_formula = f'=HYPERLINK("{slip_url}", "Buka Slip #{c["id"]}")'
        
        # Formula Denda Keterlambatan: ROUND(Jam_Telat * (Honor_Hari / 11), 0)
        formula_bruto = f"=I{curr_row}*J{curr_row}"
        formula_denda = f"=ROUND(L{curr_row}*(J{curr_row}/11), 0)"
        formula_netto = f"=K{curr_row}-M{curr_row}"
        
        row_values = [
            idx,
            c["div"],
            c["name"],
            c["nim"],
            c["hp"],
            c["method"],
            c["acc"],
            c["owner"],
            c["days"],
            c["rate"],
            formula_bruto,
            c["late_hours"],
            formula_denda,
            formula_netto,
            c["status"],
            slip_formula,
            "",  # Link bukti transfer placeholder
            c["notes"]
        ]

        for col_idx, val in enumerate(row_values, 1):
            cell = ws1.cell(row=curr_row, column=col_idx, value=val)
            cell.font = data_font
            cell.fill = fill_to_use
            cell.border = grid_border
            
            # Alignments & Formats
            if col_idx in [1, 4, 5, 6, 9, 12, 15]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [10, 11, 13, 14]:
                cell.alignment = Alignment(horizontal="right", vertical="center")
                cell.number_format = rupiah_fmt
            elif col_idx in [16]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = link_font
            elif col_idx in [17]:
                cell.alignment = Alignment(horizontal="left", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

            # Format teks khusus agar nomor rekening / HP tidak hilang angka 0 di depan
            if col_idx in [4, 7]:
                cell.number_format = '@'

            # Status styling
            if col_idx == 15:
                cell.fill = status_pending_fill
                cell.font = status_pending_font

        ws1.row_dimensions[curr_row].height = 20

    # -------------------------------------------------------------
    # BARIS 33: ALOKASI KAS UKM ESPORTS UKRIDA (Denda Keterlambatan)
    # -------------------------------------------------------------
    kas_row = header_row + len(crew) + 1
    ws1.cell(row=kas_row, column=1, value=33).alignment = Alignment(horizontal="center", vertical="center")
    ws1.cell(row=kas_row, column=2, value="Kas Organisasi").alignment = Alignment(horizontal="left", vertical="center")
    ws1.cell(row=kas_row, column=3, value="KAS UKM ESPORTS UKRIDA (Denda Telat)").alignment = Alignment(horizontal="left", vertical="center")
    ws1.cell(row=kas_row, column=4, value="-").alignment = Alignment(horizontal="center", vertical="center")
    ws1.cell(row=kas_row, column=5, value="-").alignment = Alignment(horizontal="center", vertical="center")
    ws1.cell(row=kas_row, column=6, value="Kas UKM Esports").alignment = Alignment(horizontal="center", vertical="center")
    ws1.cell(row=kas_row, column=7, value="Kas UKM Esports UKRIDA").alignment = Alignment(horizontal="left", vertical="center")
    ws1.cell(row=kas_row, column=8, value="UKM ESPORTS UKRIDA").alignment = Alignment(horizontal="left", vertical="center")
    ws1.cell(row=kas_row, column=9, value="-").alignment = Alignment(horizontal="center", vertical="center")
    ws1.cell(row=kas_row, column=10, value="-").alignment = Alignment(horizontal="right", vertical="center")
    
    # Bruto Kas = Rp 0 (karena dana berasal dari potongan denda anggota)
    c_kbruto = ws1.cell(row=kas_row, column=11, value=0)
    c_kbruto.alignment = Alignment(horizontal="right", vertical="center")
    c_kbruto.number_format = rupiah_fmt

    # Total Jam Telat Masuk Kas
    c_kjam = ws1.cell(row=kas_row, column=12, value=f"=SUM(L{start_data_row}:L{kas_row-1})")
    c_kjam.alignment = Alignment(horizontal="center", vertical="center")

    # Denda internal = 0
    c_kdenda = ws1.cell(row=kas_row, column=13, value=0)
    c_kdenda.alignment = Alignment(horizontal="right", vertical="center")
    c_kdenda.number_format = rupiah_fmt

    # Total Bersih Diterima Kas UKM Esports = SUM(Denda Seluruh Crew)
    c_knetto = ws1.cell(row=kas_row, column=14, value=f"=SUM(M{start_data_row}:M{kas_row-1})")
    c_knetto.alignment = Alignment(horizontal="right", vertical="center")
    c_knetto.number_format = rupiah_fmt

    c_kstat = ws1.cell(row=kas_row, column=15, value="Alokasi Kas")
    c_kstat.alignment = Alignment(horizontal="center", vertical="center")

    ws1.cell(row=kas_row, column=16, value="-").alignment = Alignment(horizontal="center", vertical="center")
    ws1.cell(row=kas_row, column=17, value="").alignment = Alignment(horizontal="left", vertical="center")
    ws1.cell(row=kas_row, column=18, value="Akumulasi seluruh denda keterlambatan crew (7 Jam) dialokasikan utuh masuk ke Kas UKM Esports UKRIDA").alignment = Alignment(horizontal="left", vertical="center")

    for col_idx in range(1, len(headers) + 1):
        cell = ws1.cell(row=kas_row, column=col_idx)
        cell.fill = kas_fill
        cell.border = grid_border
        cell.font = kas_font

    ws1.row_dimensions[kas_row].height = 22

    # -------------------------------------------------------------
    # BARIS TOTAL KESELURUHAN (Crew + Alokasi Kas)
    # -------------------------------------------------------------
    total_row = kas_row + 1
    ws1.cell(row=total_row, column=1, value="")
    ws1.cell(row=total_row, column=2, value="TOTAL KESELURUHAN").font = data_font_bold
    ws1.merge_cells(start_row=total_row, start_column=2, end_row=total_row, end_column=8)
    
    # Total Days Formula
    cell_tot_days = ws1.cell(row=total_row, column=9, value=f"=SUM(I{start_data_row}:I{kas_row-1})")
    cell_tot_days.font = data_font_bold
    cell_tot_days.alignment = Alignment(horizontal="center", vertical="center")
    
    # Average Rate
    cell_avg_rate = ws1.cell(row=total_row, column=10, value=f"=AVERAGE(J{start_data_row}:J{kas_row-1})")
    cell_avg_rate.font = data_font_bold
    cell_avg_rate.number_format = rupiah_fmt
    cell_avg_rate.alignment = Alignment(horizontal="right", vertical="center")

    # Total Bruto Formula
    cell_tot_bruto = ws1.cell(row=total_row, column=11, value=f"=SUM(K{start_data_row}:K{kas_row-1})")
    cell_tot_bruto.font = data_font_bold
    cell_tot_bruto.number_format = rupiah_fmt
    cell_tot_bruto.alignment = Alignment(horizontal="right", vertical="center")

    # Total Jam Telat Formula
    cell_tot_late = ws1.cell(row=total_row, column=12, value=f"=SUM(L{start_data_row}:L{kas_row-1})")
    cell_tot_late.font = data_font_bold
    cell_tot_late.alignment = Alignment(horizontal="center", vertical="center")

    # Total Potongan Formula
    cell_tot_cut = ws1.cell(row=total_row, column=13, value=f"=SUM(M{start_data_row}:M{kas_row-1})")
    cell_tot_cut.font = data_font_bold
    cell_tot_cut.number_format = rupiah_fmt
    cell_tot_cut.alignment = Alignment(horizontal="right", vertical="center")

    # Total Bersih Formula (Total Net Crew + Kas Esports = MATCH 100% dengan Total Bruto!)
    cell_tot_net = ws1.cell(row=total_row, column=14, value=f"=SUM(N{start_data_row}:N{kas_row})")
    cell_tot_net.font = data_font_bold
    cell_tot_net.number_format = rupiah_fmt
    cell_tot_net.alignment = Alignment(horizontal="right", vertical="center")

    for col_idx in range(1, len(headers) + 1):
        c = ws1.cell(row=total_row, column=col_idx)
        c.fill = total_fill
        c.border = grand_total_border

    ws1.row_dimensions[total_row].height = 24

    # Freeze Header & Kolom Kunci (D6: Freeze sampai kolom C & baris 5)
    ws1.freeze_panes = "D6"
    ws1.auto_filter.ref = f"A{header_row}:R{kas_row}"

    # Lebar Kolom Ergonomis
    col_widths = {
        "A": 6,   # No
        "B": 22,  # Divisi
        "C": 34,  # Nama Lengkap
        "D": 15,  # NIM
        "E": 18,  # No HP
        "F": 16,  # Metode
        "G": 24,  # No Rekening
        "H": 30,  # A.N
        "I": 15,  # Durasi Kerja
        "J": 17,  # Honor
        "K": 20,  # Bruto
        "L": 15,  # Jam Telat
        "M": 20,  # Denda Masuk Kas
        "N": 22,  # Bersih Ditransfer
        "O": 16,  # Status
        "P": 18,  # Link Slip
        "Q": 30,  # Link Bukti TF
        "R": 50   # Catatan
    }
    for col_l, w in col_widths.items():
        ws1.column_dimensions[col_l].width = w

    # -------------------------------------------------------------
    # SHEET 2: REKAPITULASI ANGGARAN PER DIVISI
    # -------------------------------------------------------------
    ws2 = wb.create_sheet(title="Rekap_Per_Divisi")
    ws2.views.sheetView[0].showGridLines = True

    ws2["A1"] = "REKAPITULASI ANGGARAN & DISTRIBUSI PER DIVISI"
    ws2["A1"].font = title_font
    
    ws2["A2"] = "Ringkasan Alokasi Dana untuk Pengawasan Cashflow, Denda Organisasi, dan LPJ Keuangan"
    ws2["A2"].font = meta_font

    r_headers = [
        "No",
        "Divisi Penugasan",
        "Jumlah Personil",
        "Total Man-Days (Hari)",
        "Estimasi Alokasi Bruto (Rp)",
        "Total Denda Telat (Rp)",
        "Netto Ditransfer ke Crew (Rp)",
        "Status Kesiapan Rekening"
    ]

    r_header_row = 4
    for col_idx, h in enumerate(r_headers, 1):
        c = ws2.cell(row=r_header_row, column=col_idx, value=h)
        c.font = header_font
        c.fill = header_fill
        c.border = grid_border
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    ws2.row_dimensions[r_header_row].height = 26

    rekap_categories = [
        ("Logistic", "5 Rekening Siap (4 Denda Telat)"),
        ("Floor Officer", "6 Rekening Siap"),
        ("Registration", "2 Rekening Siap"),
        ("Broadcast Officer", "1 Rekening Siap (7 Hari Kerja)"),
        ("Usher Awarding", "2 Rekening Siap"),
        ("UKM Tari Tradisional", "7 Rekening Siap"),
        ("UKM Modern Dance", "4 Rekening & Kontak Lengkap"),
        ("Marketing / Socmed", "5 Menunggu No Rekening")
    ]

    r_start_data = 5
    for idx, (cat_name, status_rek) in enumerate(rekap_categories, 1):
        curr_r = r_header_row + idx
        fill_to_use = zebra_even if idx % 2 == 0 else zebra_odd
        
        # Formulas referencing Sheet 1
        formula_personil = f'=COUNTIF(Data_Honorarium_Crew!$B$6:$B$37, "{cat_name}")'
        formula_mandays = f'=SUMIF(Data_Honorarium_Crew!$B$6:$B$37, "{cat_name}", Data_Honorarium_Crew!$I$6:$I$37)'
        formula_bruto = f'=SUMIF(Data_Honorarium_Crew!$B$6:$B$37, "{cat_name}", Data_Honorarium_Crew!$K$6:$K$37)'
        formula_denda = f'=SUMIF(Data_Honorarium_Crew!$B$6:$B$37, "{cat_name}", Data_Honorarium_Crew!$M$6:$M$37)'
        formula_netto = f'=SUMIF(Data_Honorarium_Crew!$B$6:$B$37, "{cat_name}", Data_Honorarium_Crew!$N$6:$N$37)'

        ws2.cell(row=curr_r, column=1, value=idx).alignment = Alignment(horizontal="center", vertical="center")
        ws2.cell(row=curr_r, column=2, value=cat_name).alignment = Alignment(horizontal="left", vertical="center")
        ws2.cell(row=curr_r, column=3, value=formula_personil).alignment = Alignment(horizontal="center", vertical="center")
        ws2.cell(row=curr_r, column=4, value=formula_mandays).alignment = Alignment(horizontal="center", vertical="center")
        
        c_bruto = ws2.cell(row=curr_r, column=5, value=formula_bruto)
        c_bruto.alignment = Alignment(horizontal="right", vertical="center")
        c_bruto.number_format = rupiah_fmt

        c_denda = ws2.cell(row=curr_r, column=6, value=formula_denda)
        c_denda.alignment = Alignment(horizontal="right", vertical="center")
        c_denda.number_format = rupiah_fmt

        c_net = ws2.cell(row=curr_r, column=7, value=formula_netto)
        c_net.alignment = Alignment(horizontal="right", vertical="center")
        c_net.number_format = rupiah_fmt

        c_stat = ws2.cell(row=curr_r, column=8, value=status_rek)
        c_stat.alignment = Alignment(horizontal="center", vertical="center")
        if "Menunggu" in status_rek:
            c_stat.fill = status_pending_fill
            c_stat.font = status_pending_font
        else:
            c_stat.font = data_font

        for col_idx in range(1, len(r_headers) + 1):
            cell = ws2.cell(row=curr_r, column=col_idx)
            if col_idx != 8 or "Menunggu" not in status_rek:
                cell.fill = fill_to_use
                cell.font = data_font
            cell.border = grid_border

        ws2.row_dimensions[curr_r].height = 20

    # Baris Alokasi Kas Esports pada Sheet 2
    r_kas_row = r_header_row + len(rekap_categories) + 1
    ws2.cell(row=r_kas_row, column=1, value=9).alignment = Alignment(horizontal="center", vertical="center")
    ws2.cell(row=r_kas_row, column=2, value="Kas UKM Esports (Denda)").alignment = Alignment(horizontal="left", vertical="center")
    ws2.cell(row=r_kas_row, column=3, value="-").alignment = Alignment(horizontal="center", vertical="center")
    ws2.cell(row=r_kas_row, column=4, value="-").alignment = Alignment(horizontal="center", vertical="center")
    
    ws2.cell(row=r_kas_row, column=5, value=0).number_format = rupiah_fmt
    ws2.cell(row=r_kas_row, column=5).alignment = Alignment(horizontal="right", vertical="center")

    ws2.cell(row=r_kas_row, column=6, value=0).number_format = rupiah_fmt
    ws2.cell(row=r_kas_row, column=6).alignment = Alignment(horizontal="right", vertical="center")

    c_kas_net = ws2.cell(row=r_kas_row, column=7, value="=Data_Honorarium_Crew!N38")
    c_kas_net.alignment = Alignment(horizontal="right", vertical="center")
    c_kas_net.number_format = rupiah_fmt

    ws2.cell(row=r_kas_row, column=8, value="Dialokasikan ke Kas UKM").alignment = Alignment(horizontal="center", vertical="center")

    for col_idx in range(1, len(r_headers) + 1):
        cell = ws2.cell(row=r_kas_row, column=col_idx)
        cell.fill = kas_fill
        cell.border = grid_border
        cell.font = kas_font

    ws2.row_dimensions[r_kas_row].height = 22

    # Total Rekap Sheet 2
    r_total_row = r_kas_row + 1
    ws2.cell(row=r_total_row, column=1, value="")
    ws2.cell(row=r_total_row, column=2, value="TOTAL KESELURUHAN").font = data_font_bold
    ws2.cell(row=r_total_row, column=3, value=f"=SUM(C{r_start_data}:C{r_start_data+len(rekap_categories)-1})").font = data_font_bold
    ws2.cell(row=r_total_row, column=3).alignment = Alignment(horizontal="center", vertical="center")
    
    ws2.cell(row=r_total_row, column=4, value=f"=SUM(D{r_start_data}:D{r_start_data+len(rekap_categories)-1})").font = data_font_bold
    ws2.cell(row=r_total_row, column=4).alignment = Alignment(horizontal="center", vertical="center")

    c_tot_bruto = ws2.cell(row=r_total_row, column=5, value=f"=SUM(E{r_start_data}:E{r_kas_row})")
    c_tot_bruto.font = data_font_bold
    c_tot_bruto.number_format = rupiah_fmt
    c_tot_bruto.alignment = Alignment(horizontal="right", vertical="center")

    c_tot_denda = ws2.cell(row=r_total_row, column=6, value=f"=SUM(F{r_start_data}:F{r_start_data+len(rekap_categories)-1})").font = data_font_bold
    c_tot_denda.font = data_font_bold
    c_tot_denda.number_format = rupiah_fmt
    c_tot_denda.alignment = Alignment(horizontal="right", vertical="center")

    c_tot_net = ws2.cell(row=r_total_row, column=7, value=f"=SUM(G{r_start_data}:G{r_kas_row})").font = data_font_bold
    c_tot_net.font = data_font_bold
    c_tot_net.number_format = rupiah_fmt
    c_tot_net.alignment = Alignment(horizontal="right", vertical="center")

    ws2.cell(row=r_total_row, column=8, value="Dana 100% Seimbang").font = data_font_bold
    ws2.cell(row=r_total_row, column=8).alignment = Alignment(horizontal="center", vertical="center")

    for col_idx in range(1, len(r_headers) + 1):
        c = ws2.cell(row=r_total_row, column=col_idx)
        c.fill = total_fill
        c.border = grand_total_border

    ws2.row_dimensions[r_total_row].height = 24

    ws2.column_dimensions["A"].width = 6
    ws2.column_dimensions["B"].width = 26
    ws2.column_dimensions["C"].width = 16
    ws2.column_dimensions["D"].width = 22
    ws2.column_dimensions["E"].width = 26
    ws2.column_dimensions["F"].width = 24
    ws2.column_dimensions["G"].width = 28
    ws2.column_dimensions["H"].width = 32

    # -------------------------------------------------------------
    # SHEET 3: PANDUAN PENGGUNAAN GOOGLE SHEETS
    # -------------------------------------------------------------
    ws3 = wb.create_sheet(title="Panduan_Google_Sheets")
    ws3.views.sheetView[0].showGridLines = True

    ws3["A1"] = "PANDUAN IMPORT & PENGGUNAAN DI GOOGLE SHEETS"
    ws3["A1"].font = title_font

    guides = [
        ("1. Cara Upload / Buka di Google Sheets:", "Buka Google Drive (drive.google.com) > Klik tombol '+ Baru' > 'Upload File' > Pilih file ini (Rekap_Honorarium_MDL_Playoff.xlsx).\nAtau buka sheets.google.com > Klik 'Buka pemilih file' (ikon folder) > Tab 'Upload' > Drag & drop file ini."),
        ("2. Kebijakan Denda Keterlambatan (Masuk Kas UKM Esports):", "Standar jam kerja adalah 11 jam/hari (Rp 150.000). Tarif denda per jam adalah Rp 13.636.\nTotal keterlambatan 7 jam (Dimas 1j, Budi 2j, Candra 1j, Kevin 1j, Rizky 2j) dengan nilai Rp 95.455 dialokasikan utuh masuk ke Kas UKM Esports UKRIDA sehingga total pengeluaran anggaran tetap presisi dan seimbang."),
        ("3. Pertukaran Shift Rizky & Nico:", "Gaji Rizky Ramadhan dari hari Senin s.d. Rabu (3 hari) full dialihkan dan diterima oleh Nico Fernando.\nRizky dihitung 4 hari aktif (Kamis-Minggu), sedangkan Nico dihitung 7 hari aktif (4 hari Broadcast + 3 hari Logistic)."),
        ("4. Mengisi Link Bukti Transfer:", "Kolom Q ('Link Bukti Transfer') disiapkan untuk menyimpan URL tangkapan layar m-Banking BCA saat transfer selesai.\nTips: Buat 1 folder di Google Drive bernama 'Bukti Transfer MDL Playoff', upload semua screenshot transfer, klik kanan foto > 'Bagikan' (Siapa saja yang memiliki link), lalu tempel (paste) link-nya ke kolom Q."),
        ("5. Buka Slip Online:", "Klik langsung link pada Kolom P ('Buka Slip #X') untuk membuka halaman web rincian slip honorarium interaktif mahasiswa yang live di GitHub Pages.")
    ]

    row_g = 3
    for title, desc in guides:
        if title:
            ws3.cell(row=row_g, column=1, value=title).font = section_font
            row_g += 1
        lines = desc.split("\n")
        for line in lines:
            ws3.cell(row=row_g, column=1, value=line).font = data_font
            row_g += 1
        row_g += 1

    ws3.column_dimensions["A"].width = 110

    # Simpan File Excel
    wb.save(output_file)
    print(f"[OK] Berhasil membuat berkas Excel: {output_file}")

if __name__ == "__main__":
    out_path = "/home/arthurreezan/invoice-mahasiswa/Rekap_Honorarium_MDL_Playoff.xlsx"
    build_payroll_excel(out_path)
