export function storageSyncSet(key: string, items: any) {
  return new Promise((resolve, reject) => {
    try {
      console.log(key, items);
      chrome.storage.sync.set({ [key]: items }, () => {
        resolve();
      });
    } catch(err) {
      reject(err);
    }
  });
}

export function storageSyncGet(key: string[]) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(key, items => {
        resolve(items);
      });
    } catch(err) {
      reject(err);
    }
  });
}