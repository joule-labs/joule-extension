import { browser, Notifications } from 'webextension-polyfill-ts';
import { NotificationMessage } from '../util/messages';

const DEFAULT_SETTINGS = {
  iconUrl: 'icon128.png',
};

export function createNotification(
  options: Notifications.CreateNotificationOptions,
  id?: string,
) {
  browser.runtime.sendMessage({
    application: 'Joule',
    notification: true,
    args: {
      method: 'create',
      options: { ...DEFAULT_SETTINGS, ...options },
      id,
    },
  } as NotificationMessage);
}

export function updateNotification(
  options: Notifications.CreateNotificationOptions,
  id: string,
) {
  browser.runtime.sendMessage({
    application: 'Joule',
    notification: true,
    args: {
      method: 'update',
      options: { ...DEFAULT_SETTINGS, ...options },
      id,
    },
  } as NotificationMessage);
}

export async function clearNotification(id: string) {
  browser.runtime.sendMessage({
    application: 'Joule',
    notification: true,
    args: {
      method: 'clear',
      id,
    },
  } as NotificationMessage);
}
