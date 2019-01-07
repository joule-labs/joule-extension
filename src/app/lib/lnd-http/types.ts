// Shared Types
export type Macaroon = string;

export type Response<T> = Promise<T>;

export type AddressType = 'np2wkh' | 'p2wkh';

export interface ErrorResponse {
  error: string;
  code: number;
}

export interface NodeAddress {
  network: string;
  addr: string;
}

export interface LightningNode {
  alias: string;
  color: string;
  addresses: NodeAddress[];
  last_update: number;
  pub_key: string;
}

export interface HTLC {
  amount: number;
  hash_lock: string;
  expiration_height: number;
  incoming: boolean;
}

export interface Channel {
  csv_delay: number;
  chan_id: string;
  num_updates: number;
  private: boolean;
  pending_htlcs: HTLC[];
  remote_balance: string;
  commit_weight: string;
  channel_point: string;
  capacity: string;
  local_balance: string;
  total_satoshis_received: string;
  active: boolean;
  remote_pubkey: string;
  commit_fee: string;
  fee_per_kw: string;
  unsettled_balance: string;
  total_satoshis_sent: string;
}

export interface HopHint {
  chan_id: string;
  citv_expiry_delta: string;
  node_id: string;
  fee_base_msat: number;
  fee_proportional_millionths: string;
}

export interface RouteHint {
  hop_hints: HopHint[];
}

export interface Hop {
  chan_id: string;
  fee: string;
  expiry: string;
  amt_to_forward_msat: string;
  fee_msat: string;
  chan_capacity: string;
  amt_to_forward: string;
}

export interface Route {
  total_amt: string;
  total_amt_msat: string;
  total_fees: string;
  total_fees_msat: string;
  total_time_lock: string;
  hops: Hop[];
}

export interface BitcoinTransaction {
  amount: string;
  dest_addresses: string[];
  tx_hash: string;
  total_fees: string;
  time_stamp: string;
  num_confirmations: number;
  block_height: number;
  block_hash: string;
}

export interface LightningPayment {
  payment_hash: string;
  fee: string;
  creation_date: string;
  value_sat: string;
  value_msat: string;
  payment_preimage: string;
  path: string[];
}

export interface LightningInvoice {
  route_hints: RouteHint[];
  creation_date: string;
  settle_date: string;
  expiry: string;
  value?: string;
  amt_paid_sat?: string;
  amt_paid_msat?: string;
  settle_index: string;
  add_index: string;
  payment_request: string;
  r_preimage: string;
  settled: boolean;
  cltv_expiry: number;
  receipt: number;
  description_hash: string;
  memo?: string;
  fallback_addr: string;
  private: boolean;
  r_hash: string;
}

type FeeLimit = { percent: string } | { fixed: string };

export interface Peer {
  ping_time: string;
  sat_sent: string;
  address: string;
  bytes_sent: string;
  sat_recv: string;
  inbound: boolean;
  pub_key: string;
  bytes_recv: string;
}

// Argument & Response Types
export interface GetInfoResponse {
  identity_pubkey: string;
  chains: string[];
  alias: string;
  version: string;
  best_header_timestamp: string;
  block_hash: string;
  uris: string[];
  num_active_channels: number;
  num_peers: number;
  synced_to_chain: boolean;
  block_height: number;
  num_pending_channels: number;
  testnet: boolean;
}

export interface GetNodeInfoResponse {
  total_capacity: number;
  num_channels: number;
  node: LightningNode;
}

export interface GetChannelsResponse {
  channels: Channel[];
}

export interface GetBlockchainBalanceResponse {
  unconfirmed_balance: string;
  confirmed_balance: string;
  total_balance: string;
}

export interface GetChannelsBalanceResponse {
  pending_open_balance: string;
  balance: string;
}

export interface GetTransactionsResponse {
  transactions: BitcoinTransaction[];
}

export interface GetPaymentsResponse {
  payments: LightningPayment[];
}

export interface GetInvoicesArguments {
  pending_only?: boolean;
  index_offset?: number;
  num_max_invoices?: number;
  reversed?: boolean;
}

export interface GetInvoicesResponse {
  invoices: LightningInvoice[];
  first_index_offset: number;
  last_index_offset: number;
}

export type GetInvoiceResponse = LightningInvoice;

export interface DecodePaymentRequestResponse {
  timestamp: string;	
  payment_hash: string;
  description: string;
  expiry: string;
  description_hash: string;
  route_hints: RouteHint[];
  destination: string;
  num_satoshis?: string;
  cltv_expiry: string;
  fallback_addr: string;
}

export interface QueryRoutesArguments {
  num_routes?: number;
  final_clv_delta?: number;
  fee_limit?: 'fixed' | 'percent';
}

export interface QueryRoutesResponse {
  routes: Route[];
}

export type SendPaymentArguments = {
  payment_request: string;
  amt?: string;
  fee_limit?: FeeLimit;
} | {
  dest_string: string;
  amt: string;
  final_cltv_delta: string;
  payment_hash_string: string;
  fee_limit?: FeeLimit;
};

export interface SendPaymentResponse {
  payment_route: Route;
  payment_preimage: string;
};

export interface CreateInvoiceArguments {
  value?: string;
  memo?: string;
  expiry?: string | number;
  fallback_addr?: string;
}

export interface CreateInvoiceResponse {
  payment_request: string;
  add_index: string;
}

export interface NewAddressArguments {
  type: AddressType;
}

export interface NewAddressResponse {
  address: string;
}

export interface GetPeersResponse {
  peers: Peer[];
}
