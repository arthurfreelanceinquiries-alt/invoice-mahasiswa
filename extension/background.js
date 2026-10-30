/**
 * Arthur MDL WhatsApp Dispatcher - background service worker (MV3)
 *
 * Tugas utama:
 *  - Menerima DISPATCH_STUDENT dari content_slip.js (halaman slip.html)
 *  - Menjamin HANYA SATU tab WhatsApp Web yang dipakai ulang (chrome.tabs.update)
 *  - Menerima STUDENT_SENT dari content_wa.js lalu meneruskannya ke slip.html
 */

'use strict';

const WA_TAB_URLS = ['*://web.whatsapp.com/*', '*://api.whatsapp.com/*'];
const SLIP_TAB_URLS = [
  'https://arthurfreelanceinquiries-alt.github.io/*',
  '*://*/*slip.html*',
  'http://localhost/*',
  'http://127.0.0.1/*'
];

const LAST_TASK_KEY = 'mdl_last_task';

function safeLastError() {
  if (chrome.runtime && chrome.runtime.lastError) {
    // Membaca lastError mencegah warning "Unchecked runtime.lastError".
    return chrome.runtime.lastError.message || String(chrome.runtime.lastError);
  }
  return null;
}

async function readLastTask() {
  try {
    const data = await chrome.storage.local.get(LAST_TASK_KEY);
    return data && data[LAST_TASK_KEY] ? data[LAST_TASK_KEY] : null;
  } catch (err) {
    console.warn('[MDL Dispatcher] Gagal membaca state:', err);
    return null;
  }
}

async function writeLastTask(task) {
  try {
    await chrome.storage.local.set({ [LAST_TASK_KEY]: task });
  } catch (err) {
    console.warn('[MDL Dispatcher] Gagal menyimpan state:', err);
  }
}

function buildWhatsAppUrl(task) {
  if (task && task.url) return task.url;
  const phone = String((task && task.phone) || '').replace(/[^0-9]/g, '');
  const text = encodeURIComponent((task && (task.text || task.msg)) || '');
  return `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
}

async function findWhatsAppTab() {
  let tabs = [];
  try {
    tabs = await chrome.tabs.query({ url: WA_TAB_URLS });
  } catch (err) {
    console.warn('[MDL Dispatcher] chrome.tabs.query gagal:', err);
  }

  if (!tabs || tabs.length === 0) return null;

  // Prioritaskan tab WhatsApp Web (bukan api.whatsapp.com) dan tab yang sedang aktif.
  const webTabs = tabs.filter((tab) => /web\.whatsapp\.com/i.test(tab.url || ''));
  const pool = webTabs.length > 0 ? webTabs : tabs;
  return pool.find((tab) => tab.active) || pool[0];
}

async function focusTabWindow(tab) {
  if (!tab || typeof tab.windowId !== 'number') return;
  try {
    await chrome.windows.update(tab.windowId, { focused: true });
  } catch (err) {
    // chrome.windows tidak selalu tersedia tanpa permission "windows"; abaikan.
    safeLastError();
  }
}

async function handleDispatchStudent(message, sender) {
  const studentId = message.studentId;
  const url = buildWhatsAppUrl(message);

  const existingTab = await findWhatsAppTab();
  let tab;

  if (existingTab) {
    // REUSE: navigasikan tab WhatsApp Web yang sudah ada, jangan buka tab baru.
    tab = await chrome.tabs.update(existingTab.id, { url, active: true });
    await focusTabWindow(tab || existingTab);
  } else {
    // Pertama kali saja: buat SATU tab WhatsApp Web.
    tab = await chrome.tabs.create({ url, active: true });
  }

  const tabId = (tab && tab.id) || (existingTab && existingTab.id) || null;

  await writeLastTask({
    studentId,
    phone: message.phone || '',
    text: message.text || message.msg || '',
    url,
    tabId,
    status: 'navigating',
    time: Date.now(),
    sourceTabId: (sender && sender.tab && sender.tab.id) || null
  });

  console.log('[MDL Dispatcher] Dispatch student', studentId, 'via tab', tabId);
  return { ok: true, tabId, reused: Boolean(existingTab) };
}

async function handleStudentSent(message) {
  const lastTask = await readLastTask();
  const studentId = message.studentId != null ? message.studentId : (lastTask && lastTask.studentId);

  if (lastTask) {
    await writeLastTask({
      ...lastTask,
      status: 'sent',
      sentAt: Date.now()
    });
  }

  let slipTabs = [];
  try {
    slipTabs = await chrome.tabs.query({ url: SLIP_TAB_URLS });
  } catch (err) {
    console.warn('[MDL Dispatcher] Gagal mencari tab slip.html:', err);
  }

  const payload = { type: 'MDL_STUDENT_SENT', studentId };

  await Promise.all(
    (slipTabs || []).map(async (tab) => {
      if (typeof tab.id !== 'number') return;
      try {
        await chrome.tabs.sendMessage(tab.id, payload);
      } catch (err) {
        // Tab mungkin belum siap / content script belum ter-inject. Bukan error fatal.
        safeLastError();
      }
    })
  );

  console.log('[MDL Dispatcher] Student', studentId, 'dilaporkan terkirim.');
  return { ok: true, studentId };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return undefined;

  if (message.action === 'DISPATCH_STUDENT') {
    handleDispatchStudent(message, sender)
      .then((result) => sendResponse(result))
      .catch((err) => {
        console.error('[MDL Dispatcher] DISPATCH_STUDENT error:', err);
        sendResponse({ ok: false, error: String(err) });
      });
    return true; // async response
  }

  if (message.action === 'STUDENT_SENT') {
    handleStudentSent(message)
      .then((result) => sendResponse(result))
      .catch((err) => {
        console.error('[MDL Dispatcher] STUDENT_SENT error:', err);
        sendResponse({ ok: false, error: String(err) });
      });
    return true; // async response
  }

  if (message.action === 'GET_STATE') {
    readLastTask().then((task) => sendResponse({ ok: true, task }));
    return true;
  }

  return undefined;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[MDL Dispatcher] Extension v3.0.0 terpasang. Mode 1-Tab Reuse aktif.');
});
