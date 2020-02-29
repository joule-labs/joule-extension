import {
  SendPaymentResponse,
  CreateInvoiceResponse,
  SendOnChainResponse,
} from 'lnd/message';
import types, { PaymentRequestState, OnChainFeeEstimates } from './types';

export interface PaymentState {
  sendLightningReceipt: SendPaymentResponse | null;
  paymentRequests: { [req: string]: PaymentRequestState };
  invoice: CreateInvoiceResponse | null;
  sendOnChainReceipt: SendOnChainResponse | null;
  sendError: Error | null;
  isSending: boolean;
  invoiceError: Error | null;
  isCreatingInvoice: boolean;
  onChainFees: OnChainFeeEstimates | null;
  isFetchingFees: boolean;
  feesError: Error | null;
}

export const INITIAL_STATE: PaymentState = {
  sendLightningReceipt: null,
  paymentRequests: {},
  invoice: null,
  sendOnChainReceipt: null,
  sendError: null,
  isSending: false,
  invoiceError: null,
  isCreatingInvoice: false,
  onChainFees: null,
  isFetchingFees: false,
  feesError: null,
};

export default function channelsReducers(
  state: PaymentState = INITIAL_STATE,
  action: any,
): PaymentState {
  switch (action.type) {
    case types.SEND_PAYMENT:
      return {
        ...state,
        sendLightningReceipt: null,
        sendError: null,
        isSending: true,
      };
    case types.SEND_PAYMENT_SUCCESS:
      return {
        ...state,
        sendLightningReceipt: action.payload,
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
        sendLightningReceipt: null,
        sendOnChainReceipt: null,
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

    case types.SEND_ON_CHAIN:
      return {
        ...state,
        sendOnChainReceipt: null,
        sendError: null,
        isSending: true,
      };
    case types.SEND_ON_CHAIN_SUCCESS:
      return {
        ...state,
        sendOnChainReceipt: action.payload,
        isSending: false,
      };
    case types.SEND_ON_CHAIN_FAILURE:
      return {
        ...state,
        sendError: action.payload,
        isSending: false,
      };

    case types.FETCH_CHAIN_FEES:
      return {
        ...state,
        onChainFees: null,
        feesError: null,
        isFetchingFees: true,
      };
    case types.FETCH_CHAIN_FEES_SUCCESS:
      return {
        ...state,
        onChainFees: action.payload,
        isFetchingFees: false,
      };
    case types.FETCH_CHAIN_FEES_FAILURE:
      return {
        ...state,
        feesError: action.payload,
        isFetchingFees: false,
      };
  }

  return state;
}
