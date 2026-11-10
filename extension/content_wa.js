/**
 * Arthur MDL WhatsApp Dispatcher - content script untuk WhatsApp Web
 *
 * - Menampilkan badge status "MDL Dispatcher: Aktif (1-Tab Reuse)"
 * - Mendeteksi teks yang sudah terisi otomatis dari URL /send?phone=...&text=...
 * - Menembakkan synthetic pointer + mouse + click + fallback Enter
 * - Melapor ke background (STUDENT_SENT) setelah jeda aman 800ms
 * - TIDAK menutup tab WhatsApp Web
 */

(function () {
  'use strict';

  const BADGE_ID = 'mdl-wa-dispatcher-badge';
  const SEND_CONFIRM_DELAY = 800;

  // Tandai bahwa dispatcher ekstensi menangani tab WhatsApp ini, agar userscript
  // (jika terpasang bersamaan) tidak mengirim pesan ganda.
  function markExtensionWaActive() {
    if (document.documentElement) {
      document.documentElement.setAttribute('data-mdl-extension-wa-active', 'true');
    }
  }
  markExtensionWaActive();
  document.addEventListener('DOMContentLoaded', markExtensionWaActive);
  setTimeout(markExtensionWaActive, 500);

  let hasPendingSend = false;
  let lastSentContent = '';
  let badgeEl = null;
  let scheduledSend = false;
  let sendInFlight = false;
  let lastSendAt = 0;

  function extensionAlive() {
    try {
      return Boolean(chrome && chrome.runtime && chrome.runtime.id);
    } catch (err) {
      return false;
    }
  }

  function notifyBackground(message) {
    if (!extensionAlive()) return;
    try {
      chrome.runtime.sendMessage(message, () => {
        // Baca lastError agar Chrome tidak menampilkan warning.
        if (chrome.runtime.lastError) {
          console.debug('[MDL Dispatcher]', chrome.runtime.lastError.message);
        }
      });
    } catch (err) {
      console.debug('[MDL Dispatcher] Gagal mengirim pesan ke background:', err);
    }
  }

  function markPending(reason) {
    if (hasPendingSend) return;
    hasPendingSend = true;
    updateBadge('⚡ Pesan Terdeteksi, Menunggu Siap...', '#eab308');
    console.log('[MDL Dispatcher] Pending send:', reason);
  }

  // Tangkap parameter text seawal mungkin sebelum router WhatsApp membersihkan URL.
  function checkUrlForText() {
    const href = window.location.href;
    if (/[?&]text=/.test(href) || /[?&]phone=/.test(href)) {
      markPending('URL mengandung text/phone');
    }
  }

  // Intersep replaceState & pushState agar jejak ?text= tidak hilang.
  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    try {
      if (/[?&]text=/.test(window.location.href) || (args[2] && /[?&]text=/.test(String(args[2])))) {
        markPending('replaceState');
      }
    } catch (err) {}
    return originalReplaceState.apply(this, args);
  };

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    try {
      if (/[?&]text=/.test(window.location.href) || (args[2] && /[?&]text=/.test(String(args[2])))) {
        markPending('pushState');
      }
    } catch (err) {}
    return originalPushState.apply(this, args);
  };

  checkUrlForText();

  // ---------------- Floating badge ----------------

  function injectBadge() {
    if (document.getElementById(BADGE_ID)) {
      badgeEl = document.getElementById(BADGE_ID);
      return;
    }
    if (!document.body) return;

    badgeEl = document.createElement('div');
    badgeEl.id = BADGE_ID;
    badgeEl.style.cssText = [
      'position:fixed',
      'top:12px',
      'right:80px',
      'z-index:2147483647',
      'background:#0f172a',
      'color:#ffffff',
      'padding:6px 14px',
      'border-radius:20px',
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      'font-size:11.5px',
      'font-weight:700',
      'box-shadow:0 4px 15px rgba(0,0,0,0.3)',
      'border:1px solid #22c55e',
      'display:flex',
      'align-items:center',
      'gap:6px',
      'transition:all 0.3s ease',
      'pointer-events:none',
      'user-select:none'
    ].join(';');
    badgeEl.innerHTML =
      '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span>' +
      ' MDL Dispatcher: Aktif (1-Tab Reuse)';
    document.body.appendChild(badgeEl);
  }

  function updateBadge(text, color) {
    if (!badgeEl) injectBadge();
    if (!badgeEl) return;
    badgeEl.innerHTML =
      `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span> ${text}`;
    badgeEl.style.borderColor = color;
  }

  // ---------------- DOM helpers ----------------

  function findChatInput() {
    return (
      document.querySelector('footer div[contenteditable="true"]') ||
      document.querySelector('footer div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('div[contenteditable="true"][aria-label*="message" i]') ||
      document.querySelector('div[contenteditable="true"][aria-label*="pesan" i]') ||
      document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('div[contenteditable="true"]')
    );
  }

  function findSendButton() {
    const footer = document.querySelector('footer');
    if (!footer) return null;

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

    // Fallback: tombol terakhir di footer yang bukan mic / attach / emoji.
    const buttons = Array.from(footer.querySelectorAll('button'));
    const candidate = buttons.filter((b) => {
      const isPtt = b.querySelector('[data-icon="ptt"], [data-icon="audio"], [data-icon*="mic" i]');
      const isAttach = b.querySelector('[data-icon="attach-menu-plus"], [data-icon="plus"]');
      const isSmiley = b.querySelector('[data-icon="smiley"], [data-icon="expressions"]');
      return !isPtt && !isAttach && !isSmiley;
    });

    return candidate.length > 0 ? candidate[candidate.length - 1] : null;
  }

  function fireSyntheticClick(el) {
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
      try {
        el.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            buttons: 1
          })
        );
      } catch (err) {}
    });

    try {
      el.click();
    } catch (err) {}
  }

  function pressEnter(input) {
    try {
      input.focus();
      const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: 13,
        which: 13,
        key: 'Enter',
        code: 'Enter'
      });
      input.dispatchEvent(enterEvent);
    } catch (err) {}
  }

  // ---------------- Send flow ----------------

  function executeSend(btn, chatInput) {
    if (sendInFlight) return;
    sendInFlight = true;
    updateBadge('🚀 Mengirim Otomatis...', '#3b82f6');
    console.log('[MDL Dispatcher] Menembakkan klik pada tombol Send:', btn);

    fireSyntheticClick(btn);

    // Fallback Enter hanya jika input masih berisi teks (mencegah double-send).
    setTimeout(() => {
      const remaining = (chatInput.innerText || chatInput.textContent || '').trim();
      if (remaining.length > 0) pressEnter(chatInput);
    }, 150);

    // Jeda aman sebelum melapor terkirim.
    setTimeout(() => {
      hasPendingSend = false;
      scheduledSend = false;
      sendInFlight = false;
      lastSentContent = '';
      lastSendAt = Date.now();

      updateBadge('✅ Pesan Terkirim! (1-Tab Reuse)', '#22c55e');
      notifyBackground({ action: 'STUDENT_SENT' });

      setTimeout(() => {
        if (!hasPendingSend) updateBadge('MDL Dispatcher: Aktif (1-Tab Reuse)', '#22c55e');
      }, 3500);
    }, SEND_CONFIRM_DELAY);
  }

  function pollCheck() {
    if (document.body && !badgeEl) injectBadge();

    checkUrlForText();
    if (!hasPendingSend || scheduledSend || sendInFlight) return;

    const chatInput = findChatInput();
    if (!chatInput) return;

    const inputContent = (chatInput.innerText || chatInput.textContent || '').trim();
    if (inputContent.length === 0) return;

    // Konten yang sama sudah pernah diproses untuk task ini.
    if (inputContent === lastSentContent) return;

    const sendBtn = findSendButton();
    if (!sendBtn) return;

    scheduledSend = true;
    lastSentContent = inputContent;

    // Jeda agar draft tersinkron sempurna dengan state internal WhatsApp.
    setTimeout(() => {
      if (!hasPendingSend || sendInFlight) {
        scheduledSend = false;
        return;
      }
      const currentInput = findChatInput() || chatInput;
      const currentBtn = findSendButton() || sendBtn;
      executeSend(currentBtn, currentInput);
    }, 700);
  }

  setInterval(pollCheck, 800);

  window.addEventListener('load', injectBadge);
  window.addEventListener('popstate', checkUrlForText);
  window.addEventListener('hashchange', checkUrlForText);

  // Cegah auto-send ganda jika halaman di-reload dalam waktu sangat singkat.
  window.addEventListener('pageshow', () => {
    if (Date.now() - lastSendAt < 1500) {
      hasPendingSend = false;
      scheduledSend = false;
      sendInFlight = false;
    }
  });
})();
