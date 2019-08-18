enum LoopTypes {
  SET_LOOP = 'SET_LOOP',
  SET_LOOP_SUCCESS = 'SET_LOOP_SUCCESS',
  SET_LOOP_FAILURE = 'SET_LOOP_FAILURE',

  SET_LOOP_IN = 'SET_LOOP_IN',
  SET_LOOP_IN_SUCCESS = 'SET_LOOP_IN_SUCCESS',
  SET_LOOP_IN_FAILURE = 'SET_LOOP_IN_FAILURE',

  GET_LOOP_OUT_TERMS_SUCCESS = 'GET_LOOP_OUT_TERMS_SUCCESS',
  GET_LOOP_OUT_TERMS_FAILURE = 'GET_LOOP_OUT_TERMS_FAILURE',

  GET_LOOP_IN_TERMS_SUCCESS = 'GET_LOOP_IN_TERMS_SUCCESS',
  GET_LOOP_IN_TERMS_FAILURE = 'GET_LOOP_IN_TERMS_FAILURE',

  GET_LOOP_OUT_QUOTE = 'GET_LOOP_OUT_QUOTE',
  GET_LOOP_OUT_QUOTE_SUCCESS = 'GET_LOOP_OUT_QUOTE_SUCCESS',
  GET_LOOP_OUT_QUOTE_FAILURE = 'GET_LOOP_OUT_QUOTE_FAILURE',

  GET_LOOP_IN_QUOTE = 'GET_LOOP_IN_QUOTE',
  GET_LOOP_IN_QUOTE_SUCCESS = 'GET_LOOP_IN_QUOTE_SUCCESS',
  GET_LOOP_IN_QUOTE_FAILURE = 'GET_LOOP_IN_QUOTE_FAILURE',

  LOOP_OUT = 'GET_LOOP_OUT',
  LOOP_OUT_SUCCESS = 'LOOP_OUT_SUCCESS',
  LOOP_OUT_FAILURE = 'LOOP_OUT_FAILURE',

  LOOP_IN = 'LOOP_IN',
  LOOP_IN_SUCCESS = 'LOOP_IN_SUCCESS',
  LOOP_IN_FAILURE = 'LOOP_IN_FAILURE',

  SYNC_LOOP_STATE = 'SYNC_LOOP_STATE',
}

export interface LoopTermsPayload {
  swap_payment_dest: string;
  swap_fee_base: string;
  swap_fee_rate: string;
  prepay_amt: string;
  min_swap_amount: string;
  max_swap_amount: string;
  cltv_delta: 0;
}

export interface LoopQuotePayload {
  swap_fee: string;
  prepay_amt: string;
  miner_fee: string;
}

export interface LoopPayload {
  id: string;
  htlc_address: string;
}

export default LoopTypes;
