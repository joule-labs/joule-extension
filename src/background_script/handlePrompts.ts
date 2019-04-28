import qs from 'query-string';
import { browser, Runtime } from 'webextension-polyfill-ts';
import { OriginData } from 'utils/prompt';
import { PROMPT_TYPE } from '../webln/types';
import getNodeInfo from './getNodeInfo';

interface PromptRequest {
  type: string;
  args: any;
  origin: OriginData;
}

export function openPrompt(request: PromptRequest): Promise<any> {
  const urlParams = qs.stringify({
    type: request.type,
    args: JSON.stringify(request.args),
    origin: JSON.stringify(request.origin),
  });

  return new Promise((resolve, reject) => {
    browser.windows
      .create({
        url: `${browser.runtime.getURL('prompt.html')}?${urlParams}`,
        type: 'popup',
        width: 400,
        height: 580,
      })
      .then(window => {
        const tabId = window.tabs![0].id;

        const onMessageListener = (message: any, sender: Runtime.MessageSender) => {
          if (message && message.response && sender.tab && sender.tab.id === tabId) {
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

export default function handlePrompts() {
  // Background manages communication between page and its windows
  browser.runtime.onMessage.addListener((request: any) => {
    if (!request || request.application !== 'Joule' || !request.prompt) {
      return;
    }

    // Special case -- get info requires no prompt, just respond
    if (request.type === PROMPT_TYPE.INFO) {
      return getNodeInfo().then(data => ({ data }));
    }

    // WebLNProvider request, will require window open
    return openPrompt(request)
      .then(data => {
        return { data };
      })
      .catch(err => {
        return { error: err.message };
      });
  });
}
