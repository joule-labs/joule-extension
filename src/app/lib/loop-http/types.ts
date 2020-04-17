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
  cltv_delta: number;
}

export interface GetLoopQuoteResponse {
  swap_fee: string;
  prepay_amt: string;
  miner_fee: string;
}

export interface LoopOutArguments {
  amt: string;
  dest?: string;
  max_swap_routing_fee?: string;
  max_prepay_routing_fee?: string;
  max_swap_fee?: string;
  max_prepay_amt?: string;
  max_miner_fee?: string;
  loop_out_channel?: string;
  sweep_conf_target?: string;
}

export interface LoopInArguments {
  amt: string;
  max_swap_fee?: string | null;
  max_miner_fee?: string | null;
  loop_in_channel?: string;
  external_htlc?: boolean;
}

export interface LoopResponse {
  id: string;
  htlc_address: string;
}

export interface GetSwapsResponse {
  swaps: SwapResponse[];
}

export interface SwapResponse {
  amt: string;
  id: string;
  id_bytes: string;
  type: string;
  state: string;
  initiation_time: string;
  last_update_time: string;
  htlc_address: string;
  cost_server: string;
  cost_onchain: string;
  cost_offchain: string;
}
