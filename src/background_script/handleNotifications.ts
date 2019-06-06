import { browser } from 'webextension-polyfill-ts';
import { isNotificationMessage } from '../util/messages';

export default function handleNotifications() {
  browser.runtime.onMessage.addListener(request => {
    if (!isNotificationMessage(request)) {
      return;
    }

    const { method, id, options } = request.args;
    if (method === 'create' && options) {
      browser.notifications.create(id, options);
    } else if (method === 'update' && id && options) {
      browser.notifications.clear(id).then(() => {
        browser.notifications.create(id, options);
      });
    } else if (method === 'clear' && id) {
      browser.notifications.clear(id);
    } else {
      console.warn('Malformed notification message:', request);
    }
  });
}
