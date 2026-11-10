// ==UserScript==
// @name         WhatsApp Web Auto-Sender (Arthur MDL Dispatcher)
// @namespace    https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/
// @version      3.0
// @description  Zero-tab-bloat WhatsApp dispatcher: 1 tab WhatsApp Web dipakai ulang lintas-origin via GM storage. Deteksi badge, multi-selector, synthetic pointer events, dan tab tetap terbuka.
// @author       Arthur Reezan & Llamrei
// @match        https://web.whatsapp.com/*
// @match        https://api.whatsapp.com/*
// @match        https://arthurfreelanceinquiries-alt.github.io/invoice-mahasiswa/*
// @match        *://*/*slip.html*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function () {
  'use strict';

  const BRIDGE_VERSION = '3.0.0';
  const TASK_KEY = 'mdl_active_task';
  const STATUS_KEY = 'mdl_task_status';
  const BADGE_ID = 'mdl-autosend-badge';
  const TASK_MAX_AGE_MS = 15 * 60 * 1000;

  const IS_SLIP_PAGE = /slip\.html$/i.test(window.location.pathname);
  const IS_WHATSAPP_PAGE = /(^|\.)web\.whatsapp\.com$/i.test(window.location.hostname) ||
    /(^|\.)api\.whatsapp\.com$/i.test(window.location.hostname);

  function extensionWaActive() {
    return Boolean(
      document.documentElement &&
      document.documentElement.hasAttribute('data-mdl-extension-wa-active')
    );
  }

  // =====================================================================
  // BAGIAN 1: slip.html -> simpan task ke GM storage
  // =====================================================================

  function markSlipBridgeActive() {
    if (!document.documentElement) {
      setTimeout(markSlipBridgeActive, 10);
      return;
    }
    document.documentElement.setAttribute('data-mdl-userscript-active', 'true');
    document.documentElement.setAttribute('data-mdl-bridge-version', BRIDGE_VERSION);
    window.postMessage({ type: 'MDL_USERSCRIPT_READY', version: BRIDGE_VERSION }, '*');
  }

  function safeGet(key, fallback) {
    try {
      const value = GM_getValue(key, fallback);
      return value === undefined ? fallback : value;
    } catch (err) {
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      GM_setValue(key, value);
      return true;
    } catch (err) {
      console.warn('[MDL Dispatcher] GM_setValue gagal:', err);
      return false;
    }
  }

  function initSlipBridge() {
    markSlipBridgeActive();
    window.addEventListener('load', markSlipBridgeActive);
    setTimeout(markSlipBridgeActive, 500);
    setTimeout(markSlipBridgeActive, 2000);

    let slipActiveTask = null;

    // Pulihkan task yang masih berjalan jika halaman slip di-refresh.
    const storedTask = safeGet(TASK_KEY, null);
    const storedStatus = safeGet(STATUS_KEY, null);
    if (
      storedTask &&
      storedTask.time &&
      Date.now() - storedTask.time < TASK_MAX_AGE_MS &&
      !(storedStatus && storedStatus.status === 'sent' && storedStatus.taskTime === storedTask.time)
    ) {
      slipActiveTask = storedTask;
    }

    function notifyPageSent(task, source) {
      window.postMessage(
        { type: 'MDL_STUDENT_SENT', studentId: task.studentId, source: source || 'userscript' },
        '*'
      );
    }

    window.addEventListener('message', (event) => {
      if (event.source && event.source !== window) return;
      const data = event.data;
      if (!data || typeof data !== 'object' || data.type !== 'MDL_DISPATCH_STUDENT') return;

      // Jika ekstensi juga aktif, biarkan content_slip.js yang menangani dispatch
      // agar pesan tidak terkirim dua kali.
      if (document.documentElement && document.documentElement.hasAttribute('data-mdl-extension-active')) {
        return;
      }

      const task = {
        studentId: data.studentId,
        phone: data.phone || '',
        text: data.text || data.msg || '',
        msg: data.msg || data.text || '',
        url: data.url,
        time: Date.now()
      };

      slipActiveTask = task;

      // Reset status untuk task baru, lalu simpan task. Perubahan ini akan
      // didengar oleh tab WhatsApp Web melalui GM_addValueChangeListener.
      safeSet(STATUS_KEY, {
        studentId: task.studentId,
        status: 'pending',
        time: Date.now(),
        taskTime: task.time
      });
      const saved = safeSet(TASK_KEY, task);

      if (!saved) {
        window.postMessage(
          {
            type: 'MDL_BRIDGE_ERROR',
            studentId: task.studentId,
            error: 'GM_setValue gagal. Periksa izin Tampermonkey.'
          },
          '*'
        );
      }
    });

    // Dengarkan konfirmasi dari tab WhatsApp Web (remote change).
    try {
      GM_addValueChangeListener(STATUS_KEY, function (name, oldValue, newValue, remote) {
        if (!remote || !newValue || newValue.status !== 'sent') return;
        if (!slipActiveTask) return;
        if (newValue.studentId !== slipActiveTask.studentId) return;
        if (newValue.taskTime && newValue.taskTime !== slipActiveTask.time) return;

        const finished = slipActiveTask;
        slipActiveTask = null;
        notifyPageSent(finished, 'userscript');
      });
    } catch (err) {
      console.warn('[MDL Dispatcher] GM_addValueChangeListener tidak tersedia:', err);
    }

    // Fallback polling: jaga-jaga bila event lintas-tab terlewat.
    setInterval(function () {
      if (!slipActiveTask) return;
      const status = safeGet(STATUS_KEY, null);
      if (!status || status.status !== 'sent') return;
      if (status.studentId !== slipActiveTask.studentId) return;
      if (status.taskTime && status.taskTime !== slipActiveTask.time) return;

      const finished = slipActiveTask;
      slipActiveTask = null;
      notifyPageSent(finished, 'userscript-poll');
    }, 2000);
  }

  // =====================================================================
  // BAGIAN 2: WhatsApp Web -> ambil task, navigasi 1 tab, auto-send
  // =====================================================================

  let hasPendingSend = false;
  let lastSentContent = '';
  let badgeEl = null;
  let scheduledSend = false;
  let sendInFlight = false;
  let activeTask = null;

  function updateBadge(text, color) {
    if (!badgeEl) injectBadge();
    if (!badgeEl) return;
    badgeEl.innerHTML =
      `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span> ${text}`;
    badgeEl.style.borderColor = color;
  }

  function injectBadge() {
    if (document.getElementById(BADGE_ID)) {
      badgeEl = document.getElementById(BADGE_ID);
      return;
    }
    if (!document.body) return;

    badgeEl = document.createElement('div');
    badgeEl.id = BADGE_ID;
    badgeEl.style.cssText = `
      position: fixed;
      top: 12px;
      right: 80px;
      z-index: 2147483647;
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
      user-select: none;
    `;
    badgeEl.innerHTML =
      '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span>' +
      ' MDL Dispatcher: Aktif (1-Tab Reuse)';
    document.body.appendChild(badgeEl);
  }

  // Tangkap parameter text seawal mungkin sebelum dihapus oleh router WhatsApp.
  function checkUrlForText() {
    const href = window.location.href;
    if (/[?&]text=/.test(href) || /[?&]phone=/.test(href)) {
      if (!hasPendingSend) {
        hasPendingSend = true;
        updateBadge('⚡ Pesan Terdeteksi, Menunggu Siap...', '#eab308');
      }
    }
  }

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    try {
      if (/[?&]text=/.test(window.location.href) || (args[2] && /[?&]text=/.test(String(args[2])))) {
        hasPendingSend = true;
      }
    } catch (err) {}
    return originalReplaceState.apply(this, args);
  };

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    try {
      if (/[?&]text=/.test(window.location.href) || (args[2] && /[?&]text=/.test(String(args[2])))) {
        hasPendingSend = true;
      }
    } catch (err) {}
    return originalPushState.apply(this, args);
  };

  function getPhoneFromUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      return (parsed.searchParams.get('phone') || '').replace(/[^0-9]/g, '');
    } catch (err) {
      return '';
    }
  }

  function isCurrentUrlForTask(url) {
    const targetPhone = getPhoneFromUrl(url);
    const currentPhone = getPhoneFromUrl(window.location.href);
    if (targetPhone && currentPhone) return targetPhone === currentPhone;
    return String(url || '') === window.location.href;
  }

  function isTaskAlreadySent(task, status) {
    return Boolean(
      task &&
      status &&
      status.status === 'sent' &&
      status.studentId === task.studentId &&
      status.taskTime === task.time
    );
  }

  function handleIncomingTask(task) {
    if (!task || !task.url) return;
    if (extensionWaActive()) return; // Ekstensi sudah menangani dispatch di tab ini.

    const status = safeGet(STATUS_KEY, null);
    if (isTaskAlreadySent(task, status)) return;

    activeTask = task;

    if (isCurrentUrlForTask(task.url)) {
      hasPendingSend = true;
      updateBadge('⚡ Task Diterima, Menunggu Chat Siap...', '#eab308');
      return;
    }

    // JANGAN membuka tab baru: navigasikan tab WhatsApp Web yang sedang aktif.
    updateBadge('🔀 Mengalihkan tab ke mahasiswa berikutnya...', '#3b82f6');
    window.location.href = task.url;
  }

  function reportTaskSent() {
    if (!activeTask) return;

    const finished = activeTask;
    activeTask = null;

    safeSet(STATUS_KEY, {
      studentId: finished.studentId,
      status: 'sent',
      time: Date.now(),
      taskTime: finished.time
    });
  }

  function initWhatsAppBridge() {
    checkUrlForText();

    // Adopsi task yang URL-nya sedang dibuka (setelah navigasi 1-tab reload).
    const storedTask = safeGet(TASK_KEY, null);
    if (
      storedTask &&
      storedTask.url &&
      storedTask.time &&
      Date.now() - storedTask.time < TASK_MAX_AGE_MS &&
      isCurrentUrlForTask(storedTask.url) &&
      !isTaskAlreadySent(storedTask, safeGet(STATUS_KEY, null))
    ) {
      activeTask = storedTask;
      hasPendingSend = true;
      updateBadge('⚡ Task Diterima, Menunggu Chat Siap...', '#eab308');
    }

    // Task baru dari slip.html (lintas-tab, lintas-origin via GM storage).
    try {
      GM_addValueChangeListener(TASK_KEY, function (name, oldValue, newValue, remote) {
        if (!remote || !newValue || !newValue.url) return;
        handleIncomingTask(newValue);
      });
    } catch (err) {
      console.warn('[MDL Dispatcher] GM_addValueChangeListener tidak tersedia:', err);
    }
  }

  // ---------------- Multi-strategy send button finder ----------------

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

  // ---------------- Send executor ----------------

  function executeSend(btn, chatInput) {
    if (sendInFlight) return;
    if (extensionWaActive()) return; // Hindari double-send saat ekstensi aktif.
    sendInFlight = true;
    updateBadge('🚀 Mengirim Otomatis...', '#3b82f6');
    console.log('⚡ [MDL Dispatcher] Menembakkan klik pada tombol Send:', btn);

    fireSyntheticClick(btn);

    setTimeout(() => {
      const remaining = (chatInput.innerText || chatInput.textContent || '').trim();
      if (remaining.length > 0) pressEnter(chatInput);
    }, 150);

    setTimeout(() => {
      hasPendingSend = false;
      scheduledSend = false;
      sendInFlight = false;
      lastSentContent = '';

      reportTaskSent();
      updateBadge('✅ Pesan Terkirim! (1-Tab Reuse)', '#22c55e');

      setTimeout(() => {
        if (!hasPendingSend) updateBadge('MDL Dispatcher: Aktif (1-Tab Reuse)', '#22c55e');
      }, 3500);
    }, 800);
  }

  function findChatInput() {
    return (
      document.querySelector('footer div[contenteditable="true"]') ||
      document.querySelector('div[contenteditable="true"][aria-label*="message" i]') ||
      document.querySelector('div[contenteditable="true"][aria-label*="pesan" i]') ||
      document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('div[contenteditable="true"]')
    );
  }

  function pollCheck() {
    if (document.body && !badgeEl) injectBadge();

    if (extensionWaActive()) {
      updateBadge('🟢 Extension Dispatcher Aktif (1-Tab Reuse)', '#22c55e');
      return;
    }

    checkUrlForText();
    if (!hasPendingSend || scheduledSend || sendInFlight) return;

    const chatInput = findChatInput();
    if (!chatInput) return;

    const inputContent = (chatInput.innerText || chatInput.textContent || '').trim();
    if (inputContent.length === 0) return;
    if (inputContent === lastSentContent) return;

    const sendBtn = findSendButton();
    if (!sendBtn) return;

    scheduledSend = true;
    lastSentContent = inputContent;

    setTimeout(() => {
      if (!hasPendingSend || sendInFlight) {
        scheduledSend = false;
        return;
      }
      const currentInput = findChatInput() || chatInput;
      const currentBtn = findSendButton() || sendBtn;
      executeSend(currentBtn, currentInput);
    }, 600);
  }

  // =====================================================================
  // BOOTSTRAP
  // =====================================================================

  if (IS_SLIP_PAGE) {
    initSlipBridge();
  } else if (IS_WHATSAPP_PAGE) {
    initWhatsAppBridge();
    setInterval(pollCheck, 800);
    window.addEventListener('load', injectBadge);
    window.addEventListener('popstate', checkUrlForText);
    window.addEventListener('hashchange', checkUrlForText);
  }
})();
