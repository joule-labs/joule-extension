import types, { LoopTermsPayload } from './types';

export interface LoopState {
  loopTerms: null | LoopTermsPayload;
}

export const INITIAL_STATE: LoopState = {
  loopTerms: {
    swap_payment_dest: '',
    swap_fee_base: '',
    swap_fee_rate: '',
    prepay_amt: '',
    min_swap_amount: '',
    max_swap_amount: '',
    cltv_delta: 0,
  },
};

export default function loopReducers(
  state: LoopState = INITIAL_STATE,
  action: any,
): LoopState {
  switch (action.type) {
    case types.GET_LOOP_TERMS:
      return {
        ...state,
      };
    case types.GET_LOOP_TERMS_SUCCESS:
      return {
        ...state,
        loopTerms: action.payload,
      };
    case types.GET_LOOP_TERMS_FAILURE:
      return {
        ...state,
      };
  }

  return state;
}
