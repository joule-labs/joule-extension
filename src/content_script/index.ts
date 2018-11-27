import { browser } from 'webextension-polyfill-ts';
import shouldInject from './shouldInject';
import injectScript from './injectScript';
import { PROMPT_TYPE } from '../webln/types';

if (shouldInject()) {
  injectScript();

  window.addEventListener('message', ev => {
    // Only accept messages from the current window
    if (ev.source !== window) {
      return;
    }

    if (ev.data && ev.data.application === 'Joule' && !ev.data.response) {
      browser.runtime.sendMessage(ev.data).then(response => {
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

// Intercept any `lightning:{paymentReqest}` requests
// TODO: Get ts to type this function
if (document && document.body) {
  document.body.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    if (!target || !target.closest) {
      return;
    }

    const lightningLink = target.closest('[href^="lightning:"]');
    if (lightningLink) {
      const href = lightningLink.getAttribute('href') as string;
      const paymentRequest = href.replace('lightning:', '');
      browser.runtime.sendMessage({
        application: 'Joule',
        prompt: true,
        type: PROMPT_TYPE.PAYMENT,
        args: { paymentRequest },
      });
      ev.preventDefault();
    }
  });
}