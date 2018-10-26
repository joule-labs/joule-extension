import 'babel-polyfill';
import shouldInject from './shouldInject';
import injectScript from './injectScript';

if (shouldInject()) {
  injectScript();

  window.addEventListener('message', ev => {
    // Only accept messages from the current window
    if (ev.source !== window) {
      return;
    }

    if (ev.data && ev.data.application === 'Joule' && !ev.data.response) {
      chrome.runtime.sendMessage(ev.data, response => {
        window.postMessage({
          application: 'Joule',
          response: true,
          error: response.error,
          data: response.data,
        }, '*');
      });
    }
  });
}
