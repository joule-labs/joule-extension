import types, { CharmPayload } from './types';
import LoopHttpClient, {
  LoopResponse,
  GetLoopQuoteResponse,
  GetLoopTermsResponse,
  GetSwapsResponse,
} from 'lib/loop-http';

interface LoopTypeState {
  terms: null | GetLoopTermsResponse;
  isFetchingTerms: boolean;
  fetchTermsError: null | Error;

  quote: null | GetLoopQuoteResponse;
  isFetchingQuote: boolean;
  fetchQuoteError: null | Error;

  loopReceipt: null | LoopResponse;
  isLooping: boolean;
  loopError: null | Error;
}

export interface LoopState {
  lib: null | LoopHttpClient;
  url: null | string;

  isCheckingUrl: boolean;
  checkUrlError: null | Error;

  swapInfo: null | GetSwapsResponse;
  isFetchingSwaps: boolean;
  fetchingSwapsError: null | Error;

  charm: null | CharmPayload;

  out: LoopTypeState;
  in: LoopTypeState;
}

const INITIAL_LOOP_TYPE_STATE: LoopTypeState = {
  terms: null,
  isFetchingTerms: false,
  fetchTermsError: null,

  quote: null,
  isFetchingQuote: false,
  fetchQuoteError: null,

  loopReceipt: null,
  isLooping: false,
  loopError: null,
};

export const INITIAL_STATE: LoopState = {
  lib: null,
  url: null,
  isCheckingUrl: false,
  checkUrlError: null,

  swapInfo: null,
  isFetchingSwaps: false,
  fetchingSwapsError: null,

  out: { ...INITIAL_LOOP_TYPE_STATE },
  in: { ...INITIAL_LOOP_TYPE_STATE },

  charm: null,
};

// Handy helper function to point to which state key we should target. Relies
// on the actions containing "LOOP_IN" or "LOOP_OUT", so make sure you do that.
function getLoopActionType(type: string): 'out' | 'in' {
  return type.includes('LOOP_OUT') ? 'out' : 'in';
}

export default function loopReducers(
  state: LoopState = INITIAL_STATE,
  action: any,
): LoopState {
  const loopType = getLoopActionType(action.type);

  switch (action.type) {
    case types.SET_LOOP_URL:
      return {
        ...state,
        url: null,
        lib: null,
        isCheckingUrl: true,
        checkUrlError: null,
      };
    case types.SET_LOOP_URL_SUCCESS:
      return {
        ...state,
        url: action.payload,
        isCheckingUrl: false,
        lib: new LoopHttpClient(action.payload),
      };
    case types.SET_LOOP_URL_FAILURE:
      return {
        ...state,
        isCheckingUrl: false,
        checkUrlError: action.payload,
      };

    case types.GET_LOOP_OUT_TERMS:
    case types.GET_LOOP_IN_TERMS:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          terms: null,
          isFetchingTerms: true,
          fetchTermsError: null,
        },
      };
    case types.GET_LOOP_OUT_TERMS_SUCCESS:
    case types.GET_LOOP_IN_TERMS_SUCCESS:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          terms: action.payload,
          isFetchingTerms: false,
        },
      };
    case types.GET_LOOP_OUT_TERMS_FAILURE:
    case types.GET_LOOP_IN_TERMS_FAILURE:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          isFetchingTerms: false,
          fetchTermsError: action.payload,
        },
      };

    case types.GET_LOOP_OUT_QUOTE:
    case types.GET_LOOP_IN_QUOTE:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          quote: null,
          isFetchingQuote: true,
          fetchQuoteError: null,
        },
      };
    case types.GET_LOOP_OUT_QUOTE_SUCCESS:
    case types.GET_LOOP_IN_QUOTE_SUCCESS:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          quote: action.payload,
          isFetchingQuote: false,
        },
      };
    case types.GET_LOOP_OUT_QUOTE_FAILURE:
    case types.GET_LOOP_IN_QUOTE_FAILURE:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          fetchQuoteError: action.payload,
          isFetchingQuote: false,
        },
      };

    case types.LOOP_OUT:
    case types.LOOP_IN:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          loopReceipt: null,
          isLooping: true,
          loopError: null,
        },
      };
    case types.LOOP_OUT_SUCCESS:
    case types.LOOP_IN_SUCCESS:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          loopReceipt: action.payload,
          isLooping: false,
        },
      };
    case types.LOOP_OUT_FAILURE:
    case types.LOOP_IN_FAILURE:
      return {
        ...state,
        [loopType]: {
          ...state[loopType],
          loopError: action.payload,
          isLooping: false,
        },
      };

    case types.LIST_SWAPS:
      return {
        ...state,
        swapInfo: null,
        isFetchingSwaps: true,
        fetchingSwapsError: null,
      };
    case types.LIST_SWAPS_SUCCESS:
      return {
        ...state,
        swapInfo: action.payload,
        isFetchingSwaps: false,
        fetchingSwapsError: null,
      };
    case types.LIST_SWAPS_FAILURE:
      return {
        ...state,
        swapInfo: null,
        isFetchingSwaps: false,
        fetchingSwapsError: action.payload,
      };

    case types.RESET_LOOP:
      return {
        ...state,
        in: { ...INITIAL_LOOP_TYPE_STATE },
        out: { ...INITIAL_LOOP_TYPE_STATE },
      };

    case types.SYNC_LOOP_STATE:
      return {
        ...state,
        ...action.payload,
      };
    case types.SYNC_CHARM_STATE:
      return {
        ...state,
        ...action.payload,
      };

    case types.ACTIVATE_CHARM:
      return {
        ...state,
        charm: action.payload,
      };
    case types.DEACTIVATE_CHARM:
      return {
        ...state,
        charm: null,
      };
  }
  return state;
}
