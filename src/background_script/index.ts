import qs from 'query-string';
import { browser, Runtime, Menus } from 'webextension-polyfill-ts';
import { getOriginData, OriginData } from 'utils/prompt';
import { isValidPaymentReq } from 'utils/validators';
import { PROMPT_TYPE } from '../webln/types';
import getNodeInfo from './getNodeInfo';

interface PromptRequest {
  type: string;
  args: any;
  origin: OriginData;
}

function openPrompt(request: PromptRequest): Promise<any> {
  const urlParams = qs.stringify({
    type: request.type,
    args: JSON.stringify(request.args),
    origin: JSON.stringify(request.origin),
  });

  return new Promise((resolve, reject) => {
    browser.windows.create({
      url: `${browser.runtime.getURL('prompt.html')}?${urlParams}`,
      type: 'popup',
      width: 400,
      height: 580,
    }).then(window => {
      const tabId = window.tabs![0].id;

      const onMessageListener = (message: any, sender: Runtime.MessageSender) => {
        if (sender.tab && sender.tab.id === tabId) {
          chrome.tabs.onRemoved.removeListener(onRemovedListener);
          if (message.error) {
            reject(new Error(message.error));
          } else {
            resolve(message.data);
          }
          chrome.windows.remove(sender.tab.windowId as number);
        }
      };

      const onRemovedListener = (tid: number) => {
        if (tabId === tid) {
          chrome.runtime.onMessage.removeListener(onMessageListener as any);
          reject(new Error('Prompt was closed'));
        }
      };

      chrome.runtime.onMessage.addListener(onMessageListener as any);
      chrome.tabs.onRemoved.addListener(onRemovedListener);
    });
  });
}

// Need to store the payment request string in a background variable
// to support the case where the user right-clicks on text without
// selecting it first. In this situation, the background script does
// not have access to the page dom to pull the string in the context
// menu onclick handler.
let currentPaymentRequest: string;

// Background manages communication between page and its windows
browser.runtime.onMessage.addListener((request: any) => {
  // abort early for other extensions
  if (!request || request.application !== 'Joule') return;

  // Special cases
  switch (request.type) {
    case PROMPT_TYPE.INFO:
      // get info requires no prompt, just respond
      return getNodeInfo().then(data => ({ data }));
    case PROMPT_TYPE.CONTEXT_MENU:
      // set context menu visibility based on right-clicked text
      currentPaymentRequest = request.args.paymentRequest.trim();
      const visible = isValidPaymentReq(currentPaymentRequest);
      browser.contextMenus.update('pay-with-joule', { visible });
      return;
  }

  // WebLNProvider request, will require window open
  if (request.prompt) {
    return openPrompt(request)
      .then(data => {
        return { data };
      })
      .catch(err => {
        return { error: err.message };
      });
  }
});

// Add an entry to the right-click menu
browser.contextMenus.create({
  id: 'pay-with-joule',
  title: 'Pay Lightning Invoice',
  contexts: ["selection", "page"],
  visible: false,
  onclick: (info: Menus.OnClickData) => {
    if (info.menuItemId === 'pay-with-joule') {
      // open the payment prompt
      openPrompt({
        type: PROMPT_TYPE.PAYMENT,
        args: { paymentRequest: currentPaymentRequest },
        origin: getOriginData()
      });
    }
  }
});

