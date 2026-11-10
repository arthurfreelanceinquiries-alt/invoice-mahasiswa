# 🧩 Arthur MDL WhatsApp Dispatcher (Chrome Extension v3.0)

Ekstensi Chrome **Manifest V3** untuk mengirim slip honor 16 mahasiswa UKRIDA ke WhatsApp Web
**tanpa tab bloat**: berapa pun jumlah mahasiswa yang dikirim, hanya **SATU** tab WhatsApp Web
yang dipakai ulang.

## Kenapa perlu ekstensi?

`web.whatsapp.com` memakai **Cross-Origin Opener Policy (COOP)**. Setelah tab WhatsApp Web
terbuka, browser memutus referensi `window.opener` antar-origin, sehingga `window.open(url, 'nama_tab')`
berikutnya tidak dapat menemukan tab lama dan selalu membuka tab baru. Ekstensi memakai
**Chrome Tabs API** (`chrome.tabs.query` + `chrome.tabs.update`) yang tidak terpengaruh COOP.

## Cara Pasang (Load Unpacked)

1. Buka Chrome / Edge / Brave.
2. Ketik `chrome://extensions` di address bar lalu Enter.
3. Aktifkan **Developer mode** (toggle kanan atas).
4. Klik **Load unpacked**.
5. Pilih folder `extension/` dari repositori ini (folder yang berisi `manifest.json`).
6. Pastikan kartu **Arthur MDL WhatsApp Dispatcher** muncul dan statusnya **On**.
7. Buka / refresh halaman slip:
   `https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/slip.html`
8. Buka modal **💬 Dispatcher WhatsApp**. Badge di modal harus berubah menjadi
   **🟢 Mode 1-Tab Otomatis Aktif (Zero Tab Bloat)**.

## Cara Kerja

```
slip.html  --postMessage(MDL_DISPATCH_STUDENT)-->  content_slip.js
content_slip.js  --chrome.runtime.sendMessage-->  background.js
background.js  --chrome.tabs.update(tabId, {url})-->  SATU tab WhatsApp Web
content_wa.js  --synthetic click Send + 800ms-->  background.js
background.js  --MDL_STUDENT_SENT-->  content_slip.js  --postMessage-->  slip.html
```

- `content_slip.js` menandai `<html data-mdl-extension-active="true">` agar `slip.html` tahu
  jembatan aktif.
- `background.js` menyimpan task terakhir di `chrome.storage.local`, sehingga tetap tahu
  mahasiswa mana yang sedang dikirim walau service worker sempat tidur.
- `content_wa.js` mengirim pesan otomatis lalu melapor; **tab WhatsApp Web tidak pernah ditutup**.

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| Badge masih kuning "Belum Aktif" | Pastikan ekstensi **On**, lalu **refresh** tab `slip.html`. |
| Pesan tidak terkirim otomatis | Pastikan WhatsApp Web sudah login (QR sudah dipindai). |
| Tombol Send tidak terdeteksi | Tunggu halaman WhatsApp Web selesai memuat, atau kirim manual satu kali. |
| Ingin mematikan mode 1-tab | Nonaktifkan ekstensi; `slip.html` otomatis kembali ke fallback `window.open`. |

## Catatan Keamanan

Ekstensi hanya berjalan di `slip.html`, `web.whatsapp.com`, `api.whatsapp.com`, dan
`localhost`. Tidak ada data yang dikirim ke server pihak ketiga. Nomor WhatsApp dan isi pesan
hanya berpindah antar-tab di browser Anda.
