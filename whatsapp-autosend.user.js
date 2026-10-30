// ==UserScript==
// @name         WhatsApp Web Auto-Sender (Arthur MDL Dispatcher)
// @namespace    https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/
// @version      1.2
// @description  Otomatis klik tombol Kirim (Send) pada 1 tab WhatsApp Web yang sama tanpa membuka banyak tab baru dan TANPA menutup tab setelah terkirim.
// @author       Arthur Reezan & Llamrei
// @match        https://web.whatsapp.com/*
// @match        https://api.whatsapp.com/*
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  console.log("⚡ [MDL Auto-Sender v1.2] Aktif di 1 tab WhatsApp Web (Mode: Tetap Buka / No-Close).");

  let lastProcessedUrl = '';
  let isSending = false;

  function checkAndAutoSend() {
    const currentUrl = window.location.href;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const textParam = searchParams.get('text') || hashParams.get('text');

    // Jika tidak ada parameter text atau URL ini sudah pernah dikirimkan, lewati
    if (!textParam || currentUrl === lastProcessedUrl || isSending) {
      return;
    }

    // Cari tombol kirim WhatsApp Web (bahasa Indonesia, Inggris, atau ikon SVG)
    const sendButton = 
      document.querySelector('button[aria-label="Send"]') ||
      document.querySelector('button[aria-label="Kirim"]') ||
      document.querySelector('span[data-icon="send"]')?.closest('button') ||
      document.querySelector('span[data-icon="send"]') ||
      document.querySelector('footer button[aria-label*="Send"]') ||
      document.querySelector('footer button[aria-label*="Kirim"]');

    const chatInput = document.querySelector('footer div[contenteditable="true"]');

    if (sendButton) {
      isSending = true;
      lastProcessedUrl = currentUrl;
      console.log("🎯 [MDL Auto-Sender] Draf pesan terdeteksi! Menembakkan tombol Kirim secara otomatis...");

      // Jeda 800ms agar seluruh state React WhatsApp sinkron
      setTimeout(() => {
        sendButton.click();

        // Fallback pemicu tombol Enter jika dibutuhkan
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

        console.log("✅ [MDL Auto-Sender] Pesan sukses terkirim! Tab tetap dibiarkan terbuka (tidak di-close) sesuai arahan Arthur.");

        // Buka kembali lock setelah 2.5 detik agar siap menerima mahasiswa berikutnya di tab yang sama
        setTimeout(() => {
          isSending = false;
        }, 2500);

      }, 800);
    }
  }

  // Monitor DOM dan URL secara berkala
  setInterval(checkAndAutoSend, 800);

  // Monitor navigasi SPA WhatsApp Web
  window.addEventListener('popstate', checkAndAutoSend);
  window.addEventListener('hashchange', checkAndAutoSend);

})();
