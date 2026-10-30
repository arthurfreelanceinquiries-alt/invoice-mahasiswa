// ==UserScript==
// @name         WhatsApp Web Auto-Sender (Arthur MDL Dispatcher)
// @namespace    https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/
// @version      2.0
// @description  Otomatis klik tombol Kirim (Send) pada WhatsApp Web dengan deteksi visual badge, multi-selector, dan tetap membuka tab.
// @author       Arthur Reezan & Llamrei
// @match        https://web.whatsapp.com/*
// @match        https://api.whatsapp.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // State tracker
  let hasPendingSend = false;
  let lastSentContent = '';
  let badgeEl = null;

  // Tangkap parameter text seawal mungkin sebelum dihapus oleh router internal WhatsApp
  function checkUrlForText() {
    const href = window.location.href;
    if (href.includes('text=') || href.includes('send?phone=') || href.includes('send/?phone=')) {
      hasPendingSend = true;
      updateBadge('⚡ Pesan Terdeteksi, Menunggu Siap...', '#eab308');
    }
  }

  // Intersep replaceState & pushState agar tidak kehilangan jejak saat WhatsApp membersihkan query URL
  const originalReplaceState = history.replaceState;
  history.replaceState = function(...args) {
    if (window.location.href.includes('text=') || (args[2] && String(args[2]).includes('text='))) {
      hasPendingSend = true;
    }
    return originalReplaceState.apply(this, args);
  };

  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    if (window.location.href.includes('text=') || (args[2] && String(args[2]).includes('text='))) {
      hasPendingSend = true;
    }
    return originalPushState.apply(this, args);
  };

  checkUrlForText();

  // Floating UI Badge untuk transparansi status di WhatsApp Web
  function injectBadge() {
    if (document.getElementById('mdl-autosend-badge')) return;
    badgeEl = document.createElement('div');
    badgeEl.id = 'mdl-autosend-badge';
    badgeEl.style.cssText = `
      position: fixed;
      top: 12px;
      right: 80px;
      z-index: 999999;
      background: #0f172a;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      border: 1px solid #22c55e;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    badgeEl.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span> MDL Auto-Sender: Aktif`;
    if (document.body) {
      document.body.appendChild(badgeEl);
    }
  }

  function updateBadge(text, color) {
    if (!badgeEl) return;
    badgeEl.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span> ${text}`;
    badgeEl.style.borderColor = color;
  }

  // Multi-Strategy Send Button Finder
  function findSendButton() {
    const footer = document.querySelector('footer');
    if (!footer) return null;

    // 1. Selector umum & multi-bahasa
    let btn = 
      footer.querySelector('button[aria-label="Send"]') ||
      footer.querySelector('button[aria-label="Kirim"]') ||
      footer.querySelector('button[aria-label*="send" i]') ||
      footer.querySelector('button[aria-label*="kirim" i]') ||
      footer.querySelector('span[data-icon="send"]')?.closest('button') ||
      footer.querySelector('span[data-icon="wds-ic-send-filled"]')?.closest('button') ||
      footer.querySelector('span[data-icon="send-light"]')?.closest('button') ||
      footer.querySelector('span[data-icon*="send" i]')?.closest('button');

    if (btn) return btn;

    // 2. Tombol terakhir di footer yang bukan mic/ptt
    const buttons = Array.from(footer.querySelectorAll('button'));
    const candidate = buttons.filter(b => {
      const isPtt = b.querySelector('[data-icon="ptt"], [data-icon="audio"], [data-icon*="mic" i]');
      const isAttach = b.querySelector('[data-icon="attach-menu-plus"], [data-icon="plus"]');
      const isSmiley = b.querySelector('[data-icon="smiley"], [data-icon="expressions"]');
      return !isPtt && !isAttach && !isSmiley;
    });

    if (candidate.length > 0) {
      return candidate[candidate.length - 1];
    }

    return null;
  }

  // Eksekutor Klik Send dengan Full Synthetic Pointer & Mouse Events
  function executeSend(btn, chatInput) {
    updateBadge('🚀 Mengirim Otomatis...', '#3b82f6');
    console.log("⚡ [MDL Auto-Sender] Menembakkan klik pada tombol Send:", btn);

    // Event sequence lengkap agar didengar oleh React Synthetic Event listener
    const eventTypes = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
    eventTypes.forEach(type => {
      btn.dispatchEvent(new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        buttons: 1
      }));
    });

    // Native click fallback
    try {
      btn.click();
    } catch(e) {}

    // Fallback pemicu Enter key pada chat input
    if (chatInput) {
      chatInput.focus();
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

    hasPendingSend = false;
    updateBadge('✅ Pesan Terkirim! (Tab Terbuka)', '#22c55e');

    setTimeout(() => {
      updateBadge('MDL Auto-Sender: Siap', '#22c55e');
    }, 3500);
  }

  // Loop deteksi berkala
  let pollInterval = setInterval(function pollCheck() {
    checkUrlForText();

    if (document.body && !badgeEl) {
      injectBadge();
    }

    const footer = document.querySelector('footer');
    if (!footer) return;

    const chatInput = footer.querySelector('div[contenteditable="true"]');
    const inputContent = chatInput ? (chatInput.innerText || chatInput.textContent || '').trim() : '';

    // Jika input berisi teks dan belum pernah terkirim di konten yang sama
    if (inputContent.length > 5 && (hasPendingSend || inputContent !== lastSentContent)) {
      const sendBtn = findSendButton();
      if (sendBtn) {
        lastSentContent = inputContent;
        clearInterval(pollInterval);
        
        // Jeda 600ms agar draf tersinkron sempurna di WhatsApp internal state
        setTimeout(() => {
          executeSend(sendBtn, chatInput);
          // Mulai loop kembali setelah pengiriman selesai
          pollInterval = setInterval(pollCheck, 1000);
        }, 600);
      }
    }
  }, 800);

  window.addEventListener('load', injectBadge);
  window.addEventListener('popstate', checkUrlForText);
  window.addEventListener('hashchange', checkUrlForText);

})();
