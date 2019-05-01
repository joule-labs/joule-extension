import { browser } from 'webextension-polyfill-ts';
import shouldInject from './shouldInject';
import injectScript from './injectScript';
import respondWithoutPrompt from './respondWithoutPrompt';
import { PROMPT_TYPE } from '../webln/types';
import { getOriginData } from 'utils/prompt';

if (shouldInject()) {
  injectScript();

  window.addEventListener('message', async ev => {
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
        window.postMessage(
          {
            application: 'Joule',
            response: true,
            error: response.error,
            data: response.data,
          },
          '*',
        );
      });
    }
  });
}

// Intercept any `lightning:{paymentReqest}` requests
// TODO: Get ts to type this function
if (document) {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', ev => {
      const target = ev.target as HTMLElement;
      if (!target || !target.closest) {
        return;
      }

      const lightningLink = target.closest('[href^="lightning:"]');
      if (lightningLink) {
        ev.preventDefault();
        console.log(lightningLink);
        const href = lightningLink.getAttribute('href') as string;
        const paymentRequest = href.replace('lightning:', '');
        const message = {
          application: 'Joule',
          prompt: true,
          type: PROMPT_TYPE.PAYMENT,
          origin: getOriginData(),
          args: { paymentRequest },
        };
        respondWithoutPrompt(message).then(didRespond => {
          if (didRespond) return;
          browser.runtime.sendMessage({
            application: 'Joule',
            prompt: true,
            type: PROMPT_TYPE.PAYMENT,
            origin: getOriginData(),
            args: { paymentRequest },
          });
        });
      }
    });
  });

  // Listen for right-click events to show the context menu item
  // when a potential lightning invoice is selected
  document.addEventListener(
    'mousedown',
    event => {
      // 2 = right mouse button. may be better to store in a constant
      if (event.button === 2) {
        const selection = window.getSelection();
        if (!selection) return;
        let paymentRequest = selection.toString();
        // if nothing selected, try to get the text of the right-clicked element.
        if (!paymentRequest && event.target) {
          // Cast as HTMLInputElement to get the value if a form element is used
          // since innerText will be blank.
          const target = event.target as HTMLInputElement;
          paymentRequest = target.innerText || target.value;
        }
        if (paymentRequest) {
          // Send message to background script to toggle the context menu item
          // based on the content of the right-clicked text
          browser.runtime.sendMessage({
            application: 'Joule',
            contextMenu: true,
            args: { paymentRequest },
          });
        }
      }
    },
    true,
  );
}
