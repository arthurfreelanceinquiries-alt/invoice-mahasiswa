# BRIEF TEKNIS IMPLEMENTASI: ZERO-TAB-BLOAT WHATSAPP WEB DISPATCHER (INVOICE MAHASISWA UKRIDA)

## 1. Konteks & Root Cause Masalah
Pada sistem slip gaji panitia mahasiswa UKRIDA (`slip.html`), fitur pengiriman rincian honor ke WhatsApp (`sendSingleStudentWA` dan `startAutoDispatch`) mencoba menggunakan 1 tab dengan `window.open(url, 'Arthur_MDL_WhatsApp_Web')`.
Namun di browser modern (Chrome/Edge/Brave/Firefox):
- `web.whatsapp.com` menerapkan Cross-Origin Opener Policy (COOP) dan isolasi browsing context.
- Begitu URL WhatsApp Web dimuat pada tab baru, browser memutuskan hubungan opener antar-origin (GitHub Pages vs WhatsApp).
- Panggilan `window.open` berikutnya dengan target nama yang sama TIDAK BISA mendeteksi tab tersebut, sehingga browser selalu membuka **tab baru**. Jika mengirim ke 16 mahasiswa, 16 tab WhatsApp Web terbuka secara bersamaan, membebani RAM, dan merusak alur kerja.

## 2. Solusi Arsitektur
Sediakan DUA jalur solusi terintegrasi tanpa friksi bagi Arthur:
1. **Jalur Utama (Chrome Extension Manifest V3):** Ekstensi Chrome lokal di folder `extension/` yang menggunakan Chrome Tabs API (`chrome.tabs.query`, `chrome.tabs.update`, `chrome.tabs.create`). Ekstensi ini menjamin 100% hanya ada SATU tab WhatsApp Web yang aktif dan diperbarui untuk setiap mahasiswa.
2. **Jalur Alternatif (Userscript Tampermonkey v3.0):** Memperbarui `whatsapp-autosend.user.js` agar mendukung komunikasi lintas-origin via `GM_setValue` / `GM_addValueChangeListener`, sehingga pengguna Tampermonkey juga menikmati fitur 1 tab tanpa perlu membuka tab baru.
3. **Penyelarasan `slip.html`:** Memodifikasi `slip.html` agar secara otomatis mendeteksi kehadiran Ekstensi atau Userscript (via data-attribute / postMessage). Jika aktif, `slip.html` mengalihkan pengiriman ke jembatan pesan (`window.postMessage`), bukan lagi `window.open`, serta menampilkan status "🟢 Mode 1-Tab Aktif" di modal WhatsApp.

---

## 3. Rincian Deliverables & Spesifikasi File

### A. Folder `extension/` (Chrome Extension Manifest V3)
Buat folder `extension/` dengan file-file berikut:

1. `extension/manifest.json`:
   - `manifest_version: 3`
   - `name: "Arthur MDL WhatsApp Dispatcher"`
   - `version: "3.0.0"`
   - `permissions: ["tabs", "storage"]`
   - `host_permissions: ["https://web.whatsapp.com/*", "https://api.whatsapp.com/*", "https://arthurfreelanceinquiries-alt.github.io/*", "http://localhost/*", "http://127.0.0.1/*", "*://*/*slip.html*"]`
   - `background: { "service_worker": "background.js" }`
   - `content_scripts`:
     - Script 1: matches `["https://arthurfreelanceinquiries-alt.github.io/*", "*://*/*slip.html*", "http://localhost/*", "http://127.0.0.1/*"]`, js: `["content_slip.js"]`, run_at: `document_end`.
     - Script 2: matches `["https://web.whatsapp.com/*", "https://api.whatsapp.com/*"]`, js: `["content_wa.js"]`, run_at: `document_start`.
   - `icons`: icon sederhana / svg / canvas fallback jika tidak ada file image.

2. `extension/background.js`:
   - Menangani pesan dari `content_slip.js`:
     - Action `DISPATCH_STUDENT`: Menerima `{ studentId, phone, text, url }`.
     - Menjalankan `chrome.tabs.query({ url: "*://web.whatsapp.com/*" })`:
       - Jika tab WhatsApp Web SUDAH ADA:
         Pilih tab tersebut, lakukan `chrome.tabs.update(tab.id, { url: url, active: true })`.
         Simpan state `{ studentId, tabId: tab.id, status: 'navigating' }`.
       - Jika BELUM ADA tab WhatsApp Web:
         Buat SATU tab baru: `chrome.tabs.create({ url: url, active: true })`.
     - Action `STUDENT_SENT`: Diterima dari `content_wa.js` saat pesan berhasil dikirim.
       - Kirim pesan balik ke tab `slip.html` (`chrome.tabs.sendMessage` atau broadcast) dengan payload `{ type: 'MDL_STUDENT_SENT', studentId }`.

3. `extension/content_slip.js`:
   - Menandai halaman `slip.html`:
     `document.documentElement.setAttribute('data-mdl-extension-active', 'true');`
     `window.postMessage({ type: 'MDL_EXTENSION_READY', version: '3.0.0' }, '*');`
   - Mendengarkan pesan dari `slip.html`:
     `window.addEventListener('message', (event) => { if (event.data?.type === 'MDL_DISPATCH_STUDENT') { chrome.runtime.sendMessage({ action: 'DISPATCH_STUDENT', ...event.data }); } });`
   - Mendengarkan balasan dari `background.js`:
     `chrome.runtime.onMessage.addListener((msg) => { if (msg?.type === 'MDL_STUDENT_SENT') { window.postMessage(msg, '*'); } });`

4. `extension/content_wa.js`:
   - Injeksi badge status visual mengambang di pojok kanan atas WhatsApp Web ("🟢 MDL Dispatcher: Aktif (1-Tab Reuse)").
   - Deteksi input chat dan tombol kirim menggunakan multi-selector tahan banting (seperti pada userscript existing).
   - Menembakkan event lengkap: `pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click`, dan fallback Enter key.
   - Setelah pesan terkirim, beri jeda aman (800ms) lalu kirim sinyal ke background:
     `chrome.runtime.sendMessage({ action: 'STUDENT_SENT' });`
   - Tetap membiarkan tab WhatsApp Web terbuka!

5. `extension/README.md`:
   - Panduan singkat langkah demi langkah cara memasang ekstensi di Chrome (`chrome://extensions` -> Aktifkan Developer Mode -> Load unpacked -> pilih folder `extension`).

---

### B. Pembaruan `whatsapp-autosend.user.js` (Versi 3.0)
Tingkatkan userscript agar:
1. `// @match` mencakup:
   - `https://web.whatsapp.com/*`
   - `https://api.whatsapp.com/*`
   - `https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/*`
   - `*://*/*slip.html*`
2. Tambahkan grants:
   `// @grant GM_setValue`
   `// @grant GM_getValue`
   `// @grant GM_addValueChangeListener`
3. Jika running di `slip.html`:
   - Tandai: `document.documentElement.setAttribute('data-mdl-userscript-active', 'true');`
   - Dengarkan `window.addEventListener('message', ...)` untuk event `MDL_DISPATCH_STUDENT`.
   - Simpan task ke GM storage: `GM_setValue('mdl_active_task', { studentId, phone, text, url, time: Date.now() });`
   - Dengarkan perubahan `mdl_task_status`: jika status `sent`, kirim `window.postMessage({ type: 'MDL_STUDENT_SENT', studentId }, '*')`.
4. Jika running di `web.whatsapp.com`:
   - Dengarkan `GM_addValueChangeListener('mdl_active_task', (name, oldVal, newVal) => { ... })`.
   - Saat ada task baru, jika tab sudah terbuka, navigasikan URL tab tersebut: `window.location.href = newVal.url;` (TIDAK MEMBUKA TAB BARU!).
   - Otomatis kirim pesan dengan synthetic event dispatcher, lalu perbarui `GM_setValue('mdl_task_status', { studentId: newVal.studentId, status: 'sent', time: Date.now() });`.

---

### C. Pembaruan `slip.html`
1. **Deteksi Status Bridge (Ekstensi atau Userscript):**
   - Buat fungsi pembantu `isWABridgeActive()` yang mengecek apakah `data-mdl-extension-active` atau `data-mdl-userscript-active` ada pada `document.documentElement`.
   - Tampilkan indikator status di dalam WhatsApp Modal:
     - Jika Bridge Terhubung: Tampilkan badge hijau tebal: `🟢 Mode 1-Tab Otomatis Aktif (Zero Tab Bloat)` dan sembunyikan peringatan pembukaan multi-tab.
     - Jika Belum Terpasang: Tampilkan tombol/panduan ringkas untuk memasang Ekstensi Chrome atau Userscript v3.0.
2. **Modifikasi Pengiriman (`sendSingleStudentWA` & `runNextDispatchQueue`):**
   - Periksa `if (isWABridgeActive())`:
     - JANGAN panggil `window.open(url, ...)`.
     - Kirim event: `window.postMessage({ type: 'MDL_DISPATCH_STUDENT', studentId: student.id, phone, msg, url }, '*');`
     - Perbarui status bar/badge ke "⚡ Mengirim via 1-Tab Dispatcher...".
   - Jika Bridge TIDAK aktif:
     - Tetap jalankan fallback `window.open(url, getTargetTabName())` seperti sebelumnya.
3. **Mendengarkan Sinyal Selesai (`MDL_STUDENT_SENT`):**
   - Tambahkan event listener `window.addEventListener('message', ...)`:
     - Ketika menerima `{ type: 'MDL_STUDENT_SENT', studentId }`:
       - Tandai mahasiswa tersebut sebagai terkirim (`waContacts[studentId].sent = true`).
       - Perbarui UI tabel & counter terkirim.
       - Jika antrean auto-dispatch sedang berjalan, lanjutkan ke mahasiswa berikutnya secara mulus!

---

### D. Pembaruan `README.md`
Tambahkan subbab dokumentasi jelas tentang solusi "Zero Tab Bloat: WhatsApp 1-Tab Dispatcher":
- Penjelasan mengapa browser memblokir reuse tab (COOP policy).
- Panduan Pasang Ekstensi Chrome (Folder `extension/`).
- Panduan Pasang Userscript Tampermonkey v3.0.

---

## 4. Langkah Verifikasi Mandatori
1. Cek sintaks seluruh file JavaScript (`node --check extension/background.js`, `node --check extension/content_slip.js`, `node --check extension/content_wa.js`, `node --check whatsapp-autosend.user.js`).
2. Pastikan `manifest.json` valid JSON dan mematuhi spesifikasi Manifest V3.
3. Jalankan `git status` dan `git diff` untuk memastikan tidak ada syntax error atau regresi pada fungsi payroll di `slip.html`.
