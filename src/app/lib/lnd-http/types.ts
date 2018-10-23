export type Macaroon = string;

export type Response<T> = Promise<T>;

export interface ErrorResponse {
  error: string;
  code: number;
}

export interface GetInfoResponse {
  identity_pubkey: string;
  chains: string[];
  alias: string;
  version: string;
  best_header_timestamp: number;
  block_hash: string;
  uris?: string[];
  num_active_channels?: number;
  num_peers?: number;
  synced_to_chain?: boolean;
  block_height?: number;
  num_pending_channels?: number;
  testnet?: boolean;
}