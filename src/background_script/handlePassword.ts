import { browser } from 'webextension-polyfill-ts';

let cachedPassword: string | undefined;

export default function handlePassword() {
  browser.runtime.onMessage.addListener((request, sender) => {
    if (!request || request.application !== 'Joule') {
      return;
    }

    // Set the password cache from the app
    if (request.setPassword) {
      cachedPassword = request.data.password;
    }

    // Clear the password cache
    if (request.clearPassword) {
      cachedPassword = undefined;
    }

    // Send the password cache back to the app
    if (request.getPassword) {
      const msg = {
        application: 'Joule',
        cachedPassword: true,
        data: cachedPassword,
      };
      if (sender.tab && sender.tab.id) {
        browser.tabs.sendMessage(sender.tab.id, msg);
      } else {
        browser.runtime.sendMessage(msg);
      }
    }
  });
}
