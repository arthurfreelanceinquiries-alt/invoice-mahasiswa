/**
 * Arthur MDL WhatsApp Dispatcher - content script untuk slip.html
 *
 * Menjembatani halaman slip.html (page context) dengan background service worker
 * (extension context) menggunakan window.postMessage + chrome.runtime.sendMessage.
 */

(function () {
  'use strict';

  const BRIDGE_VERSION = '3.0.0';

  function announceReady() {
    if (!document.documentElement) return;
    document.documentElement.setAttribute('data-mdl-extension-active', 'true');
    document.documentElement.setAttribute('data-mdl-bridge-version', BRIDGE_VERSION);
    window.postMessage({ type: 'MDL_EXTENSION_READY', version: BRIDGE_VERSION }, '*');
  }

  function extensionAlive() {
    try {
      return Boolean(chrome && chrome.runtime && chrome.runtime.id);
    } catch (err) {
      return false;
    }
  }

  function postStatus(type, payload) {
    window.postMessage({ type, ...(payload || {}) }, '*');
  }

  // 1) Tandai halaman bahwa ekstensi aktif.
  announceReady();

  // Ulangi saat load agar listener slip.html yang telat terdaftar tetap menerima event.
  window.addEventListener('load', announceReady);
  setTimeout(announceReady, 500);
  setTimeout(announceReady, 2000);

  // 2) Terima perintah dispatch dari slip.html.
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || typeof data !== 'object' || data.type !== 'MDL_DISPATCH_STUDENT') return;

    if (!extensionAlive()) {
      postStatus('MDL_BRIDGE_ERROR', {
        studentId: data.studentId,
        error: 'Extension context tidak tersedia. Muat ulang halaman.'
      });
      return;
    }

    try {
      chrome.runtime.sendMessage(
        {
          action: 'DISPATCH_STUDENT',
          studentId: data.studentId,
          phone: data.phone,
          text: data.text || data.msg,
          msg: data.msg || data.text,
          url: data.url
        },
        (response) => {
          if (chrome.runtime.lastError) {
            postStatus('MDL_BRIDGE_ERROR', {
              studentId: data.studentId,
              error: chrome.runtime.lastError.message
            });
            return;
          }
          postStatus('MDL_DISPATCH_ACK', {
            studentId: data.studentId,
            tabId: response && response.tabId,
            reused: Boolean(response && response.reused)
          });
        }
      );
    } catch (err) {
      postStatus('MDL_BRIDGE_ERROR', {
        studentId: data.studentId,
        error: String(err)
      });
    }
  });

  // 3) Teruskan sinyal "terkirim" dari background ke halaman slip.html.
  chrome.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== 'MDL_STUDENT_SENT') return undefined;
    window.postMessage(
      {
        type: 'MDL_STUDENT_SENT',
        studentId: message.studentId,
        source: 'extension'
      },
      '*'
    );
    return undefined;
  });
})();
