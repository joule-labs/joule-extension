import { browser } from 'webextension-polyfill-ts';
import shouldInject from './shouldInject';
import injectScript from './injectScript';
import respondWithoutPrompt from './respondWithoutPrompt';
import { PROMPT_TYPE } from '../webln/types';
import { getOriginData } from 'utils/prompt';

if (shouldInject()) {
  injectScript();

  window.addEventListener('message', async (ev) => {
    // Only accept messages from the current window
    if (ev.source !== window) {
      return;
    }

    if (ev.data && ev.data.application === 'Joule' && !ev.data.response) {
      const messageWithOrigin = {
        ...ev.data,
        origin: getOriginData(),
      };

      // Some prompt requests can be responded to immediately
      const didRespond = await respondWithoutPrompt(messageWithOrigin);
      if (didRespond) {
        return;
      }

      browser.runtime.sendMessage(messageWithOrigin).then(response => {
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
if (document) {
  document.addEventListener('DOMContentLoaded', () => {
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
  });
}