import qs from 'query-string';
import { browser } from 'webextension-polyfill-ts';

export function confirmPrompt(data?: any) {
  browser.runtime.sendMessage({
    application: 'Joule',
    data,
  });
}

export function rejectPrompt(message?: string) {
  browser.runtime.sendMessage({
    application: 'Joule',
    error: message || 'User rejected prompt',
  });
}

export function getPromptType(): string {
  const { type } = qs.parse(window.location.search);
  if (!type) {
    return 'unknown';
  }
  return type as string;
}

export function getPromptArgs<R extends object>(): R {
  if (!window.location.search) {
    throw new Error('Missing prompt arguments');
  }
  const { args } = qs.parse(window.location.search);
  return JSON.parse(args as string) as R;
}

// Used in components that call sagas and need to wait for a prop,
// continues to check for either the data prop or error prop and
// resolves promise with whichever comes first.
export function watchUntilPropChange<D, E>(getData: () => D, getError: () => E): Promise<D> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const data = getData();
      if (data) {
        clearInterval(interval);
        return resolve(data);
      }
      const error = getError();
      if (error) {
        clearInterval(interval);
        return reject(error);
      }
    }, 50);
  });
}