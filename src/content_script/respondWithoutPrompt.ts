import bolt11 from 'bolt11';
import { runSelector, runAction } from './store';
import { PROMPT_TYPE } from '../webln/types';
import { selectSettings } from 'modules/settings/selectors';
import { sendPayment } from 'modules/payment/actions';
import {
  AnyPromptMessage,
  AuthorizePromptMessage,
  PaymentPromptMessage,
} from '../util/messages';

export default async function respondWithoutPrompt(
  msg: AnyPromptMessage,
): Promise<boolean> {
  switch (msg.type) {
    case PROMPT_TYPE.AUTHORIZE:
      return handleAuthorizePrompt(msg);
    case PROMPT_TYPE.PAYMENT:
      return handleAutoPayment(msg);
  }
  return false;
}

async function handleAuthorizePrompt(msg: AuthorizePromptMessage) {
  const { domain } = msg.origin;
  const settings = await runSelector(selectSettings);

  if (domain) {
    if (settings.enabledDomains.includes(domain)) {
      postDataMessage(undefined);
      return true;
    } else if (settings.rejectedDomains.includes(domain)) {
      postErrorMessage('User rejected prompt');
      return true;
    }
  }

  return false;
}

async function handleAutoPayment(msg: PaymentPromptMessage) {
  // Disable (for now)
  return false;

  // Pop up for non-fixed invoices
  const decoded = bolt11.decode(msg.args.paymentRequest);
  if (!decoded.satoshis) {
    return false;
  }

  // Attempt to send the payment
  const state = await runAction(
    sendPayment({
      payment_request: msg.args.paymentRequest,
      fee_limit: {
        fixed: '10',
      },
    }),
    s =>
      !!s.payment.sendError ||
      !!s.payment.sendLightningReceipt ||
      !!s.crypto.isRequestingPassword,
  );

  // If it failed for any reason or we need their pw, we'll just open the prompt
  if (state.payment.sendError || state.crypto.isRequestingPassword) {
    return false;
  } else {
    return true;
  }
}

function postDataMessage(data: any) {
  window.postMessage(
    {
      application: 'Joule',
      response: true,
      data,
    },
    '*',
  );
}

function postErrorMessage(error: string) {
  window.postMessage(
    {
      application: 'Joule',
      response: true,
      error,
    },
    '*',
  );
}
