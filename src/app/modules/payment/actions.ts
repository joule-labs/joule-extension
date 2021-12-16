import {
  SendPaymentArguments,
  CreateInvoiceArguments,
  SendOnChainArguments,
} from 'lib/lnd-http';
import types from './types';

export function checkPaymentRequest(paymentRequest: string, amount?: string) {
  return {
    type: types.CHECK_PAYMENT_REQUEST,
    payload: {
      paymentRequest,
      amount,
    },
  };
}

export function sendPayment(payload: SendPaymentArguments) {
  return {
    type: types.SEND_PAYMENT,
    payload,
  };
}

export function sendOnChain(payload: SendOnChainArguments) {
  return {
    type: types.SEND_ON_CHAIN,
    payload,
  };
}

export function resetSendPayment() {
  return { type: types.RESET_SEND_PAYMENT };
}

export function createInvoice(payload: CreateInvoiceArguments) {
  return {
    type: types.CREATE_INVOICE,
    payload,
  };
}

export function resetCreateInvoice() {
  return { type: types.RESET_CREATE_INVOICE };
}

export function getOnChainFeeEstimates() {
  return { type: types.FETCH_CHAIN_FEES };
}
