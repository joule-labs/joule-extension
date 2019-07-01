enum LoopTermsTypes {
  GET_LOOP_OUT_TERMS = 'GET_LOOP_OUT_TERMS',
  GET_LOOP_OUT_TERMS_SUCCESS = 'GET_LOOP_OUT_TERMS_SUCCESS',
  GET_LOOP_OUT_TERMS_FAILURE = 'GET_LOOP_OUT_TERMS_FAILURE',
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

export default LoopTermsTypes;
