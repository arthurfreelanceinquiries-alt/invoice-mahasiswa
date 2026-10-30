// ==UserScript==
// @name         WhatsApp Web Auto-Sender (Arthur MDL Dispatcher)
// @namespace    https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/
// @version      1.1
// @description  Otomatis klik tombol Kirim (Send) dan tutup tab secara mulus saat membuka tautan WhatsApp dari Dispatcher Slip Payroll UKRIDA MDL
// @author       Arthur Reezan & Llamrei
// @match        https://web.whatsapp.com/*
// @match        https://api.whatsapp.com/*
// @grant        window.close
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  // Periksa apakah URL berasal dari pengiriman pesan (mengandung parameter 'text')
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const hasText = searchParams.has('text') || hashParams.has('text');

  if (!hasText) {
    return;
  }

  console.log("⚡ [MDL Auto-Sender] Tautan pesan terdeteksi. Menginisialisasi auto-send...");

  let attempts = 0;
  const maxAttempts = 40; // Timeout 40 detik untuk koneksi lambat

  const checkAndSend = setInterval(() => {
    attempts++;

    // Selektor tombol kirim WhatsApp Web (mendukung bahasa Indonesia & Inggris, serta ikon svg)
    const sendButton = 
      document.querySelector('button[aria-label="Send"]') ||
      document.querySelector('button[aria-label="Kirim"]') ||
      document.querySelector('span[data-icon="send"]')?.closest('button') ||
      document.querySelector('span[data-icon="send"]') ||
      document.querySelector('footer button[aria-label*="Send"]') ||
      document.querySelector('footer button[aria-label*="Kirim"]');

    // Cek juga apakah input chat sudah memiliki teks
    const chatInput = document.querySelector('footer div[contenteditable="true"]');

    if (sendButton) {
      clearInterval(checkAndSend);
      console.log("🎯 [MDL Auto-Sender] Tombol kirim ditemukan! Menembakkan klik...");

      // Jeda 800ms agar payload teks tersinkron penuh ke state WhatsApp
      setTimeout(() => {
        sendButton.click();
        
        // Simulasikan Enter keyup sebagai fallback
        if (chatInput) {
          const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyCode: 13,
            which: 13,
            key: 'Enter',
            code: 'Enter'
          });
          chatInput.dispatchEvent(enterEvent);
        }

        console.log("✅ [MDL Auto-Sender] Pesan berhasil ditembakkan! Menutup tab...");

        // Beri waktu 2.5 detik untuk network ACK WhatsApp sebelum menutup tab
        setTimeout(() => {
          try {
            window.close();
          } catch(e) {
            console.warn("Browser mencegah auto-close, silakan tutup tab manual:", e);
          }
        }, 2500);

      }, 800);
      return;
    }

    if (attempts >= maxAttempts) {
      clearInterval(checkAndSend);
      console.warn("⚠️ [MDL Auto-Sender] Melebihi batas waktu 40 detik. Silakan klik kirim secara manual jika QR/koneksi baru sinkron.");
    }
  }, 1000);

})();
