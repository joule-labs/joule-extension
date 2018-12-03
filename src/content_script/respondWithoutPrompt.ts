import { browser } from 'webextension-polyfill-ts';
import { PROMPT_TYPE } from '../webln/types';
import { INITIAL_STATE, SettingsState } from 'modules/settings/reducers';

export default async function respondWithoutPrompt(data: any): Promise<boolean> {
  switch (data.type) {
    case PROMPT_TYPE.AUTHORIZE:
      return handleAuthorizePrompt(data);
  }

  return false;
}


async function handleAuthorizePrompt(data: any) {
  // Settings might not be set, so mix with initial state
  // TODO: Make function for this behavior
  const { domain } = data.origin;
  const store = await browser.storage.sync.get('settings');
  const settings: SettingsState = {
    ...INITIAL_STATE,
    ...store && store.settings || {},
  };

  if (domain) {
    if (settings.enabledDomains.includes(domain)) {
      window.postMessage({
        application: 'Joule',
        response: true,
        data: undefined,
      }, '*');
      return true;
    }
    else if (settings.rejectedDomains.includes(domain)) {
      window.postMessage({
        application: 'Joule',
        response: true,
        error: 'User rejected prompt',
      }, '*');
      return true;
    }
  }

  return false;
}
