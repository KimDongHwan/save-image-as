import { getFormat, originPattern, convertAndDownload } from './convert.js';

const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);

function showError(msg) {
  $('grant').hidden = true;
  $('error').hidden = false;
  $('error-msg').textContent = msg;
}

$('close').onclick = () => window.close();
$('cancel').onclick = () => window.close();

if (params.get('mode') === 'error') {
  showError(params.get('msg') || 'Unknown error.');
} else {
  const src = params.get('src');
  const format = getFormat(params.get('fmt'));
  const pattern = originPattern(src);
  $('grant').hidden = false;
  $('origin').textContent = new URL(src).origin;

  async function grantAndSave(origins) {
    // Must be called directly from the click handler (user gesture).
    const granted = await chrome.permissions.request({ origins });
    if (!granted) return;
    try {
      await convertAndDownload(src, format);
      window.close();
    } catch (err) {
      if (err?.message?.includes('Download canceled')) return window.close();
      showError(err?.message || String(err));
    }
  }

  $('allow-site').onclick = () => grantAndSave([pattern]);
  $('allow-all').onclick = () => grantAndSave(['<all_urls>']);
}
