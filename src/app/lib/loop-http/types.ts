// Shared Types
export type Response<T> = Promise<T>;

export interface ErrorResponse {
  error: string;
  code: number;
}

export interface GetLoopOutTermsResponse {
  swap_payment_dest: string;
  swap_fee_base: string;
  swap_fee_rate: string;
  prepay_amt: string;
  min_swap_amount: string;
  max_swap_amount: string;
  cltv_delta: 0;
}

export interface GetLoopOutQuoteResponse {
  swap_fee: string;
  prepay_amt: string;
  miner_fee: string;
}

export interface GetLoopOutArguments {
  amt: string;
  dest: string;
  max_swap_routing_fee: string | null;
  max_prepay_routing_fee: string | null;
  max_swap_fee: string | null;
  max_prepay_amt: string | null;
  max_miner_fee: string | null;
  loop_out_channel: string;
}

export interface GetLoopOutResponse {
  id: string;
  htlc_address: string;
}
