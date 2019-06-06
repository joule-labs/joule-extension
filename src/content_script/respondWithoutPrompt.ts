import bolt11 from 'bolt11';
import { runSelector, runAction } from './store';
import { PROMPT_TYPE } from '../webln/types';
import { selectSettings } from 'modules/settings/selectors';
import { sendPayment } from 'modules/payment/actions';
import { selectConfigByDomain } from 'modules/appconf/selectors';
import { setAppConfig } from 'modules/appconf/actions';
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
  console.log(msg);

  // Pop up for non-fixed invoices
  const { satoshis } = bolt11.decode(msg.args.paymentRequest);
  if (!satoshis) {
    return false;
  }

  // Grab the available allowance, if possible
  const config = await runSelector(selectConfigByDomain, msg.origin.domain);
  if (!config || !config.allowance || !config.allowance.active) {
    return;
  }

  // Check that the payment is allowed via our allowance constraints
  const { allowance } = config;
  console.log('allowance', allowance);
  if (satoshis > allowance.maxPerPayment || satoshis > allowance.balance) {
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

  // If it failed for any reason or we need their password, we'll just open the prompt
  if (
    state.payment.sendError ||
    state.crypto.isRequestingPassword ||
    !state.payment.sendLightningReceipt
  ) {
    return false;
  }

  // Reduce their allowance balance by cost + fee and return true
  console.log(allowance.balance);
  console.log(state.payment.sendLightningReceipt.payment_route);
  console.log(satoshis);
  const fee = parseInt(state.payment.sendLightningReceipt.payment_route.total_fees, 10);
  await runAction(
    setAppConfig(msg.origin.domain, {
      ...config,
      allowance: {
        ...allowance,
        balance: allowance.balance - satoshis - fee,
      },
    }),
  );
  return true;
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
