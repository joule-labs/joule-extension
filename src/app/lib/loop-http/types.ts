// Shared Types
export type Response<T> = Promise<T>;

export interface ErrorResponse {
  error: string;
  code: number;
}

export interface GetLoopTermsResponse {
  swap_payment_dest: string;
  swap_fee_base: string;
  swap_fee_rate: string;
  prepay_amt: string;
  min_swap_amount: string;
  max_swap_amount: string;
  cltv_delta: 0;
}
