import types, { LoopOutTermsPayload, LoopOutQuotePayload, LoopOutPayload } from './types';
import LoopHttpClient from 'lib/loop-http';

export interface LoopState {
  loopOutTerms: null | LoopOutTermsPayload;
  loopOutQuote: null | LoopOutQuotePayload;
  loopOut: null | LoopOutPayload;
  lib: null | LoopHttpClient;
  url: null | string;
  error: null | Error;
}

export const INITIAL_STATE: LoopState = {
  lib: null,
  url: null,
  error: null,
  loopOutTerms: {
    swap_payment_dest: '',
    swap_fee_base: '',
    swap_fee_rate: '',
    prepay_amt: '',
    min_swap_amount: '',
    max_swap_amount: '',
    cltv_delta: 0,
  },
  loopOutQuote: {
    swap_fee: '',
    prepay_amt: '',
    miner_fee: '',
  },
  loopOut: {
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
        error: null,
      };
    case types.SET_LOOP_SUCCESS:
      return {
        ...state,
        url: action.payload,
        lib: new LoopHttpClient(action.payload),
        error: null,
      };
    case types.SET_LOOP_FAILURE:
      return {
        ...state,
        error: action.payload,
        lib: null,
      };
    case types.GET_LOOP_OUT_TERMS:
      return {
        ...state,
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
        loopOutQuote: action.payload,
      };
    case types.GET_LOOP_OUT_QUOTE_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case types.GET_LOOP_OUT:
      return {
        ...state,
      };
    case types.GET_LOOP_OUT_SUCCESS:
      return {
        ...state,
        loopOut: action.payload,
      };
    case types.GET_LOOP_OUT_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
  }

  return state;
}
