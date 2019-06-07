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
import { createNotification, updateNotification } from './notifications';

let lastPaymentAttempt = 0;

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
  const settings = await runSelector(selectSettings, true);

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
  // Pop up for non-fixed invoices
  const { satoshis } = bolt11.decode(msg.args.paymentRequest);
  if (!satoshis) {
    return false;
  }

  // Grab the available allowance, if possible
  const config = await runSelector(selectConfigByDomain, msg.origin.domain);
  if (!config || !config.allowance || !config.allowance.active) {
    return false;
  }

  // Check that the payment is allowed via our allowance constraints
  const { allowance } = config;
  if (satoshis > allowance.maxPerPayment || satoshis > allowance.balance) {
    return false;
  }

  // Don't allow payments to happen too fast
  const last = lastPaymentAttempt;
  const now = Date.now();
  lastPaymentAttempt = now;
  if (last + allowance.minIntervalPerPayment * 1000 > now) {
    console.warn('Site attempted to make payments too fast for allowance payment');
    return false;
  }

  // Attempt to send the payment and show a notification
  const notifId = Math.random().toString();
  createNotification(
    {
      type: 'basic',
      title: 'Autopaying invoice',
      message: `Paying ${satoshis} from your allowance...`,
    },
    notifId,
  );

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
    let message = 'An unknown error caused the payment to fail';
    if (state.crypto.isRequestingPassword) {
      message = 'Joule must be unlocked';
    } else if (state.payment.sendError) {
      message = state.payment.sendError.message;
    }
    updateNotification(
      {
        type: 'basic',
        title: 'Autopayment failed',
        message,
      },
      notifId,
    );
    return false;
  }

  // Reduce their allowance balance by cost + fee and show notification
  const fee = parseInt(state.payment.sendLightningReceipt.payment_route.total_fees, 10);
  const balance = allowance.balance - satoshis - (fee || 0);
  await runAction(
    setAppConfig(msg.origin.domain, {
      ...config,
      allowance: {
        ...allowance,
        balance,
      },
    }),
  );

  updateNotification(
    {
      type: 'basic',
      title: 'Payment complete!',
      message: `${balance} sats of allowance remaining`,
    },
    notifId,
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
