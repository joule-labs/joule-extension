import qs from 'query-string';
import { browser, MessageSender } from 'webextension-polyfill-ts';

interface PromptRequest {
  type: string;
  args: any;
}

function openPrompt(request: PromptRequest): Promise<any> {
  const urlParams = qs.stringify({
    type: request.type,
    args: JSON.stringify(request.args),
  });

  return new Promise((resolve, reject) => {
    browser.windows.create({
      url: `${browser.runtime.getURL('prompt.html')}?${urlParams}`,
      type: 'popup',
      width: 400,
      height: 580,
    }).then(window => {
      const tabId = window.tabs![0].id;

      const onMessageListener = (message: any, sender: MessageSender) => {
        if (sender.tab && sender.tab.id === tabId) {
          chrome.tabs.onRemoved.removeListener(onRemovedListener);
          if (message.error) {
            reject(new Error(message.error));
          } else {
            resolve(message.data);
          }
          chrome.windows.remove(sender.tab.windowId);
        }
      };

      const onRemovedListener = (tid: number) => {
        if (tabId === tid) {
          chrome.runtime.onMessage.removeListener(onMessageListener);
          reject(new Error('Prompt was closed'));
        }
      };

      chrome.runtime.onMessage.addListener(onMessageListener);
      chrome.tabs.onRemoved.addListener(onRemovedListener);
    });
  });
}

// Background manages communication between page and its windows
browser.runtime.onMessage.addListener((request: any) => {
  if (request && request.application === 'Joule' && request.prompt) {
    // WebLNProvider request, will require window open
    return openPrompt(request)
      .then(data => {
        return { data };
      })
      .catch(err => {
        return { error: err.message };
      });
  }
});
