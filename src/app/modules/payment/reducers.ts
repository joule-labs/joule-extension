import { SendPaymentResponse, CreateInvoiceResponse } from 'lib/lnd-http';
import types, { PaymentRequestState } from './types';

export interface PaymentState {
  sendReceipt: SendPaymentResponse | null;
  paymentRequests: { [req: string]: PaymentRequestState };
  invoice: CreateInvoiceResponse | null;
  sendError: Error | null;
  isSending: boolean;
  invoiceError: Error | null;
  isCreatingInvoice: boolean;
}

export const INITIAL_STATE: PaymentState = {
  sendReceipt: null,
  paymentRequests: {},
  invoice: null,
  sendError: null,
  isSending: false,
  invoiceError: null,
  isCreatingInvoice: false,
};

export default function channelsReducers(
  state: PaymentState = INITIAL_STATE,
  action: any,
): PaymentState {
  switch (action.type) {
    case types.SEND_PAYMENT:
      return {
        ...state,
        sendReceipt: null,
        sendError: null,
        isSending: true,
      };
    case types.SEND_PAYMENT_SUCCESS:
      return {
        ...state,
        sendReceipt: action.payload,
        isSending: false,
      };
    case types.SEND_PAYMENT_FAILURE:
      return {
        ...state,
        sendError: action.payload,
        isSending: false,
      };
    
    case types.RESET_SEND_PAYMENT:
      return {
        ...state,
        sendReceipt: null,
        sendError: null,
        isSending: false,
      };
    
    case types.CREATE_INVOICE:
      return {
        ...state,
        invoice: null,
        isCreatingInvoice: true,
        invoiceError: null,
      };
    case types.CREATE_INVOICE_SUCCESS:
      return {
        ...state,
        invoice: action.payload,
        isCreatingInvoice: false,
      };
    case types.CREATE_INVOICE_FAILURE:
      return {
        ...state,
        invoiceError: action.payload,
        isCreatingInvoice: false,
      };
    
    case types.RESET_CREATE_INVOICE:
      return {
        ...state,
        invoice: null,
        invoiceError: null,
      };
    
    case types.RESET_CREATE_INVOICE:
      return {
        ...state,
        invoice: null,
        invoiceError: null,
      };

    case types.CHECK_PAYMENT_REQUEST:
      return {
        ...state,
        paymentRequests: {
          ...state.paymentRequests,
          [action.payload.paymentRequest]: {
            data: null,
            error: null,
            isLoading: true,
          },
        },
      };
    case types.CHECK_PAYMENT_REQUEST_SUCCESS:
      return {
        ...state,
        paymentRequests: {
          ...state.paymentRequests,
          [action.payload.paymentRequest]: {
            data: action.payload,
            error: null,
            isLoading: false,
          },
        },
      };
    case types.CHECK_PAYMENT_REQUEST_FAILURE:
      return {
        ...state,
        paymentRequests: {
          ...state.paymentRequests,
          [action.payload.paymentRequest]: {
            error: action.payload.error,
            data: null,
            isLoading: false,
          },
        },
      };
  }
  
  return state;
}