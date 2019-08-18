import types, { LoopTermsPayload, LoopQuotePayload, LoopPayload } from './types';
import LoopHttpClient from 'lib/loop-http';

export interface LoopState {
  isCheckingLoop: boolean;
  loopOutTerms: LoopTermsPayload;
  loopInTerms: LoopTermsPayload;
  loopQuote: null | LoopQuotePayload;
  loop: null | LoopPayload;
  lib: null | LoopHttpClient;
  url: null | string;
  error: null | Error;
}

export const INITIAL_STATE: LoopState = {
  lib: null,
  url: null,
  error: null,
  isCheckingLoop: false,
  loopOutTerms: {
    swap_payment_dest: '',
    swap_fee_base: '',
    swap_fee_rate: '',
    prepay_amt: '',
    min_swap_amount: '',
    max_swap_amount: '',
    cltv_delta: 0,
  },
  loopInTerms: {
    swap_payment_dest: '',
    swap_fee_base: '',
    swap_fee_rate: '',
    prepay_amt: '',
    min_swap_amount: '',
    max_swap_amount: '',
    cltv_delta: 0,
  },
  loopQuote: {
    swap_fee: '',
    prepay_amt: '',
    miner_fee: '',
  },
  loop: {
    id: '',
    htlc_address: '',
  },
};

export default function loopReducers(
  state: LoopState = INITIAL_STATE,
  action: any,
): LoopState {
  switch (action.type) {
    case types.SET_LOOP:
      return {
        ...state,
        isCheckingLoop: true,
        error: null,
      };
    case types.SET_LOOP_SUCCESS:
      return {
        ...state,
        isCheckingLoop: false,
        url: action.payload,
        lib: new LoopHttpClient(action.payload),
        error: null,
      };
    case types.SET_LOOP_FAILURE:
      return {
        ...state,
        isCheckingLoop: false,
        error: action.payload,
        lib: null,
      };
    case types.GET_LOOP_OUT_TERMS_SUCCESS:
      return {
        ...state,
        loopOutTerms: action.payload,
      };
    case types.GET_LOOP_OUT_TERMS_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case types.GET_LOOP_OUT_QUOTE:
      return {
        ...state,
        error: null,
      };
    case types.GET_LOOP_OUT_QUOTE_SUCCESS:
      return {
        ...state,
        loopQuote: action.payload,
      };
    case types.GET_LOOP_OUT_QUOTE_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case types.LOOP_OUT_SUCCESS:
      return {
        ...state,
        loop: action.payload,
      };
    case types.LOOP_OUT_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    // handle loop in actions
    case types.SET_LOOP_IN:
      return {
        ...state,
        error: null,
      };
    case types.SET_LOOP_IN_SUCCESS:
      return {
        ...state,
        url: action.payload,
        lib: new LoopHttpClient(action.payload),
        error: null,
      };
    case types.SET_LOOP_IN_FAILURE:
      return {
        ...state,
        error: action.payload,
        lib: null,
      };
    case types.GET_LOOP_IN_TERMS_SUCCESS:
      return {
        ...state,
        loopInTerms: action.payload,
      };
    case types.GET_LOOP_IN_TERMS_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case types.GET_LOOP_IN_QUOTE:
      return {
        ...state,
        error: null,
      };
    case types.GET_LOOP_IN_QUOTE_SUCCESS:
      return {
        ...state,
        loopQuote: action.payload,
      };
    case types.GET_LOOP_IN_QUOTE_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case types.LOOP_IN_SUCCESS:
      return {
        ...state,
        loop: action.payload,
      };
    case types.LOOP_IN_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case types.SYNC_LOOP_STATE:
      return {
        ...state,
        ...action.payload,
      };
  }
  return state;
}
