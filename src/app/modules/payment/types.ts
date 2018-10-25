import { DecodePaymentRequestResponse, LightningNode, Route } from 'lib/lnd-http';

enum PaymentTypes {
  CHECK_PAYMENT_REQUEST = 'CHECK_PAYMENT_REQUEST',
  CHECK_PAYMENT_REQUEST_SUCCESS = 'CHECK_PAYMENT_REQUEST_SUCCESS',
  CHECK_PAYMENT_REQUEST_FAILURE = 'CHECK_PAYMENT_REQUEST_FAILURE',
  
  SEND_PAYMENT = 'SEND_PAYMENT',
  SEND_PAYMENT_SUCCESS = 'SEND_PAYMENT_SUCCESS',
  SEND_PAYMENT_FAILURE = 'SEND_PAYMENT_FAILURE',

  CREATE_INVOICE = 'CREATE_INVOICE',
  CREATE_INVOICE_SUCCESS = 'CREATE_INVOICE_SUCCESS',
  CREATE_INVOICE_FAILURE = 'CREATE_INVOICE_FAILURE',

  RESET_SEND_PAYMENT = 'RESET_SEND_PAYMENT',
  RESET_CREATE_INVOICE = 'RESET_CREATE_INVOICE',
}

export default PaymentTypes;

export interface PaymentRequestData {
  request: DecodePaymentRequestResponse;
  node: LightningNode;
  route: Route;
}

export type PaymentRequestState = {
  isLoading: true;
  error: null;
  data: null;
} | {
  isLoading: false;
  error: Error;
  data: null;
} | {
  isLoading: false;
  error: null;
  data: PaymentRequestData;
};