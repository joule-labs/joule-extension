import { browser } from 'webextension-polyfill-ts';

export function setPasswordCache(password: string) {
  browser.runtime.sendMessage({
    application: 'Joule',
    setPassword: true,
    // TODO: Add info about how long to cache password for
    data: { password },
  });
}

export function getPasswordCache() {
  return new Promise(resolve => {
    const onMessage = (request: any) => {
      if (request && request.application === 'Joule' && request.cachedPassword) {
        resolve(request.data);
      }
    };

    // Setup listener for message & timeout for if we don't hear back
    browser.runtime.onMessage.addListener(onMessage);
    setTimeout(() => {
      browser.runtime.onMessage.removeListener(onMessage);
      resolve(undefined);
    }, 100);

    // Trigger the message
    browser.runtime.sendMessage({
      application: 'Joule',
      getPassword: true,
    });
  });
}

export function clearPasswordCache() {
  browser.runtime.sendMessage({
    application: 'Joule',
    clearPassword: true,
  });
}
