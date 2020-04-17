// Shared Types
export type Macaroon = string;

export type AddressType = '0' | '2';

export type UtxoAddressType = 'NESTED_PUBKEY_HASH' | 'WITNESS_PUBKEY_HASH';

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

export enum CHANNEL_STATUS {
  OPEN = 'OPEN',
  OPENING = 'OPENING',
  CLOSING = 'CLOSING',
  WAITING = 'WAITING',
  FORCE_CLOSING = 'FORCE_CLOSING',
}

export interface BaseChannel {
  status: CHANNEL_STATUS;
  channel_point: string;
  remote_balance: string;
  local_balance: string;
  remote_node_pub: string;
  capacity: string;
}

export interface OpenChannel extends BaseChannel {
  status: CHANNEL_STATUS.OPEN;
  commit_weight: string;
  commit_fee: string;
  csv_delay: number;
  chan_id: string;
  fee_per_kw: string;
  total_satoshis_sent: string;
  total_satoshis_received: string;
  pending_htlcs: HTLC[];
  num_updates: number;
  active: boolean;
  private: boolean;
}

export interface OpeningChannel extends BaseChannel {
  status: CHANNEL_STATUS.OPENING;
  commit_weight: string;
  commit_fee: string;
  fee_per_kw: string;
  confirmation_height: number;
}

export interface ClosingChannel extends BaseChannel {
  status: CHANNEL_STATUS.CLOSING;
  closing_txid: string;
}

export interface ForceClosingChannel extends BaseChannel {
  status: CHANNEL_STATUS.FORCE_CLOSING;
  maturity_height: string;
  pending_htlcs: HTLC[];
  closing_txid: string;
  recovered_balance: string;
  limbo_balance: string;
  blocks_til_maturity: number;
}

export interface WaitingChannel extends BaseChannel {
  status: CHANNEL_STATUS.WAITING;
  limbo_balance: string;
}

export type Channel =
  | OpenChannel
  | OpeningChannel
  | ClosingChannel
  | ForceClosingChannel
  | WaitingChannel;

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

export interface ChainTransaction {
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

interface LightningAddress {
  pubkey: string;
  host: string;
}

interface Outpoint {
  txid_str: string;
  txid_bytes: string;
  outpoint_index: number;
}

export interface Utxo {
  pk_script: string;
  confirmations: string;
  amount_sat: string;
  address: string;
  type: UtxoAddressType;
  outpoint: Outpoint;
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
  channels: OpenChannel[];
}

export interface GetPendingChannelsResponse {
  pending_open_channels: OpeningChannel[];
  pending_closing_channels: ClosingChannel[];
  pending_force_closing_channels: ForceClosingChannel[];
  waiting_close_channels: WaitingChannel[];
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
  transactions: ChainTransaction[];
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

export type SendPaymentArguments =
  | {
      payment_request: string;
      amt?: string;
      fee_limit?: FeeLimit;
    }
  | {
      dest_string: string;
      amt: string;
      final_cltv_delta: string;
      payment_hash_string: string;
      fee_limit?: FeeLimit;
    };

export interface SendPaymentResponse {
  payment_route: Route;
  payment_preimage: string;
}

export interface SendOnChainArguments {
  amount?: string;
  addr: string;
  send_all?: boolean;
  sat_per_byte?: string;
  target_conf?: number;
}

export interface SendOnChainResponse {
  txid: string;
}

export interface CreateInvoiceArguments {
  value?: string;
  memo?: string;
  expiry?: string | number;
  fallback_addr?: string;
  private?: boolean;
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

export interface ConnectPeerArguments {
  addr: LightningAddress;
  perm?: boolean;
}

export interface OpenChannelParams {
  node_pubkey_string: string;
  local_funding_amount: string;
  remote_csv_delay?: string;
  target_conf?: string;
  min_confs?: number;
  sat_per_byte?: string;
  private?: boolean;
  push_sat?: string;
  min_htlc_msat?: string;
  spend_unconfirmed?: boolean;
}

export interface OpenChannelResponse {
  funding_txid_bytes: string;
  funding_txid_str: string;
  output_index: string;
}

export interface CloseChannelResponse {
  closing_txid: string;
}

export interface SignMessageParams {
  msg: string;
}

export interface SignMessageResponse {
  signature?: string;
}

export interface VerifyMessageParams {
  signature: string;
  msg: string;
}

export interface VerifyMessageResponse {
  valid: boolean;
  pubkey: string;
}

export interface GetUtxosParams {
  min_confs?: number;
  max_confs?: number;
}

export interface GetUtxosResponse {
  utxos: Utxo[];
}

// Shared API interface
export interface LndAPI {
  getInfo(): Promise<GetInfoResponse>;
  getNodeInfo(pubKey: string): Promise<GetNodeInfoResponse>;
  getChannels(): Promise<GetChannelsResponse>;
  getPendingChannels(): Promise<GetPendingChannelsResponse>;
  getBlockchainBalance(): Promise<GetBlockchainBalanceResponse>;
  getChannelsBalance(): Promise<GetChannelsBalanceResponse>;
  getTransactions(): Promise<GetTransactionsResponse>;
  getPayments(): Promise<GetPaymentsResponse>;
  getInvoices(args?: GetInvoicesArguments): Promise<GetInvoicesResponse>;
  getInvoice(paymentHash: string): Promise<GetInvoiceResponse>;
  createInvoice(args: CreateInvoiceArguments): Promise<CreateInvoiceResponse>;
  decodePaymentRequest(paymentRequest: string): Promise<DecodePaymentRequestResponse>;
  queryRoutes(
    pubKey: string,
    amount: string,
    args: QueryRoutesArguments,
  ): Promise<QueryRoutesResponse>;
  sendPayment(args: SendPaymentArguments): Promise<SendPaymentResponse>;
  sendOnChain(args: SendOnChainArguments): Promise<SendOnChainResponse>;
  getAddress(args: NewAddressArguments): Promise<NewAddressResponse>;
  getPeers(): Promise<GetPeersResponse>;
  connectPeer(address: string, perm?: boolean): Promise<{}>;
  openChannel(params: OpenChannelParams): Promise<OpenChannelResponse>;
  closeChannel(fundingTxid: string, outputIndex: string): Promise<CloseChannelResponse>;
  signMessage(message: string): Promise<SignMessageResponse>;
  verifyMessage(params: VerifyMessageParams): Promise<VerifyMessageResponse>;
  getUtxos(params?: GetUtxosParams): Promise<GetUtxosResponse>;
}

export type LndAPIMethod = keyof LndAPI;

// Browser message interface
export interface LndAPIRequestMessage<M extends LndAPIMethod> {
  type: 'lnd-api-request';
  url: string;
  macaroon: undefined | Macaroon;
  method: M;
  args: Parameters<LndAPI[M]>;
}

export interface LndAPIResponseNetworkError {
  statusText: string;
  status: number;
}

export type LndAPIResponseError =
  // Fetch error
  | LndAPIResponseNetworkError
  // LND error
  | ErrorResponse
  // Generic error
  | string;

export type LndAPIResponseMessage<M extends LndAPIMethod> =
  | {
      type: 'lnd-api-response';
      method: M;
      data: ReturnType<LndAPI[M]>;
      error: undefined;
    }
  | {
      type: 'lnd-api-response';
      method: M;
      error: LndAPIResponseError;
      data: undefined;
    };
