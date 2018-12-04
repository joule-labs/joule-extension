import runSelector from './runSelector';
import { PROMPT_TYPE } from '../webln/types';
import { selectSettings } from 'modules/settings/selectors';

export default async function respondWithoutPrompt(data: any): Promise<boolean> {
  switch (data.type) {
    case PROMPT_TYPE.AUTHORIZE:
      return handleAuthorizePrompt(data);
  }

  return false;
}

async function handleAuthorizePrompt(data: any) {
  const { domain } = data.origin;
  const settings = await runSelector(selectSettings, 'settings', 'settings');

  if (domain) {
    if (settings.enabledDomains.includes(domain)) {
      postDataMessage(undefined);
      return true;
    }
    else if (settings.rejectedDomains.includes(domain)) {
      postErrorMessage('User rejected prompt');
      return true;
    }
  }

  return false;
}

function postDataMessage(data: any) {
  window.postMessage({
    application: 'Joule',
    response: true,
    data,
  }, '*');
}

function postErrorMessage(error: string) {
  window.postMessage({
    application: 'Joule',
    response: true,
    error,
  }, '*');
}