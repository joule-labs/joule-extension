export default function injectScript() {
  try {
    if (!document) throw new Error('No document');
    const container = document.body;
    if (!container) throw new Error('No container element');
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('type', 'text/javascript');
    scriptEl.setAttribute('src', chrome.extension.getURL('inpage_script.js'));
    container.appendChild(scriptEl);
  } catch(err) {
    console.error('Joule’s WebLN injection failed', err);
  }
}
