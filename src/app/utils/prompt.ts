import qs from 'query-string';
import { browser } from 'webextension-polyfill-ts';

export interface OriginData {
  domain: string;
  name: string;
  icon: string;
}

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
  const query = qs.parse(window.location.search);
  if (!query.type) {
    return 'unknown';
  }
  return query.type as string;
}

export function getPromptArgs<R extends object>(): R {
  if (!window.location.search) {
    throw new Error('Missing prompt arguments');
  }
  const { args } = qs.parse(window.location.search);
  return JSON.parse(args as string) as R;
}

export function getPromptOrigin(): OriginData {
  if (!window.location.search) {
    throw new Error('Missing prompt arguments');
  }
  const { origin } = qs.parse(window.location.search);
  console.log(origin);
  return JSON.parse(origin as string) as OriginData;
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

// Fetch information from the page. Used in the injected scripts.
export function getOriginData(): OriginData {
  if (!window || !document) {
    throw new Error('Must be called in browser context');
  }

  return {
    domain: window.location.origin,
    name: getDocumentName(),
    icon: getDocumentIcon(),
  }
}

function getDocumentName() {
  const nameMeta: HTMLMetaElement | null = document.querySelector('head > meta[property="og:site_name"]');
  if (nameMeta) {
    return nameMeta.content;
  }

  const titleMeta: HTMLMetaElement | null = document.querySelector('head > meta[name="title"]')
  if (titleMeta) {
    return titleMeta.content
  }

  return document.title;
}

function getDocumentIcon() {
  // Search for largest icon first
  const allIcons = Array.from<HTMLLinkElement>(
    document.querySelectorAll('head > link[rel="icon"]')
  ).filter(icon => !!icon.href);

  if (allIcons.length) {
    const href = allIcons.sort((a, b) => {
      const aSize = parseInt(a.getAttribute('sizes') || '0', 10);
      const bSize = parseInt(b.getAttribute('sizes') || '0', 10);
      return bSize - aSize;
    })[0].href;
    return makeAbsoluteUrl(href);
  }

  // Try for favicon
  const favicon: HTMLLinkElement | null = document.querySelector('head > link[rel="shortcut icon"]');
  if (favicon) {
    return makeAbsoluteUrl(favicon.href);
  }

  // Fallback to default favicon path, let it be replaced in view if it fails
  return `${window.location.origin}/favicon.ico`;
}

// Makes absolute path given any path on the site, namely relative ones
// e.g. ./favicon.ico becomes https://site.com/favicon.ico
function makeAbsoluteUrl(path: string) {
  return new URL(path, window.location.origin).href;
}