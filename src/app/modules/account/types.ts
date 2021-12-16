import {
  LightningNode,
  LightningInvoice,
  LightningPayment,
  ChainTransaction,
} from 'lib/lnd-http';

enum AccountTypes {
  GET_ACCOUNT_INFO = 'GET_ACCOUNT_INFO',
  GET_ACCOUNT_INFO_SUCCESS = 'GET_ACCOUNT_INFO_SUCCESS',
  GET_ACCOUNT_INFO_FAILURE = 'GET_ACCOUNT_INFO_FAILURE',

  GET_TRANSACTIONS = 'GET_TRANSACTIONS',
  GET_TRANSACTIONS_SUCCESS = 'GET_TRANSACTIONS_SUCCESS',
  GET_TRANSACTIONS_FAILURE = 'GET_TRANSACTIONS_FAILURE',

  GET_DEPOSIT_ADDRESS = 'GET_DEPOSIT_ADDRESS',
  GET_DEPOSIT_ADDRESS_SUCCESS = 'GET_DEPOSIT_ADDRESS_SUCCESS',
  GET_DEPOSIT_ADDRESS_FAILURE = 'GET_DEPOSIT_ADDRESS_FAILURE',
}

export default AccountTypes;

export interface Account {
  pubKey: string;
  alias: string;
  color: string;
  blockchainBalance: string;
  blockchainBalancePending: string;
  channelBalance: string;
  channelBalancePending: string;
  totalBalance: string;
  totalBalancePending: string;
}

export interface LightningPaymentWithToNode extends LightningPayment {
  to: LightningNode;
}

export type AnyTransaction =
  | LightningInvoice
  | LightningPaymentWithToNode
  | ChainTransaction;
