import { browser } from 'webextension-polyfill-ts';

export function storageSyncSet(key: string, items: any) {
  try {
    return browser.storage.sync.set({ [key]: items });
  } catch(err) {
    Promise.reject(err);
  }
}

export function storageSyncGet(key: string[]) {
  try {
    return browser.storage.sync.get(key);
  } catch(err) {
    Promise.reject(err);
  }
}