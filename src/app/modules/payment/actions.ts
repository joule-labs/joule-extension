import { SendPaymentArguments, CreateInvoiceArguments } from 'lib/lnd-http';
import types from './types';

export function checkPaymentRequest(payload: string) {
  return {
    type: types.CHECK_PAYMENT_REQUEST,
    payload,
  };
}

export function sendPayment(payload: SendPaymentArguments) {
  return {
    type: types.SEND_PAYMENT,
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
  return { type: types.RESET_SEND_PAYMENT };
}
