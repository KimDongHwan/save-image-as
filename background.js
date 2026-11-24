import { FORMATS, getFormat, hasAccess, convertAndDownload } from './convert.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'root', title: 'Save image as…', contexts: ['image'] });
    for (const f of FORMATS) {
      chrome.contextMenus.create({ id: f.id, parentId: 'root', title: f.label, contexts: ['image'] });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info) => handleClick(info));

async function handleClick(info) {
  const format = getFormat(info.menuItemId);
  if (!format || !info.srcUrl) return;

  try {
    if (await hasAccess(info.srcUrl)) {
      await convertAndDownload(info.srcUrl, format);
    } else {
      // No install-time "read all your data" warning: ask for access the first time it's needed.
      openPage({ mode: 'grant', src: info.srcUrl, fmt: format.id });
    }
  } catch (err) {
    if (err?.message?.includes('Download canceled')) return;
    openPage({ mode: 'error', src: info.srcUrl, msg: err?.message || String(err) });
  }
}

function openPage(params) {
  const url = chrome.runtime.getURL(`page.html?${new URLSearchParams(params)}`);
  chrome.windows.create({ url, type: 'popup', width: 460, height: 340 });
}
