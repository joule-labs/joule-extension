import types, { Account } from './types';
import { LightningInvoice, LightningPayment, BitcoinTransaction } from 'lib/lnd-http';

export interface AccountState {
  account: Account | null;
  payments: LightningPayment[] | null;
  invoices: LightningInvoice[] | null;
  transactions: BitcoinTransaction[] | null;
  isFetchingAccountInfo: boolean;
  fetchAccountInfoError: null | Error;
  isFetchingTransactions: boolean;
  fetchTransactionsError: null | Error;
}

export const INITIAL_STATE: AccountState = {
  account: null,
  payments: null,
  invoices: null,
  transactions: null,
  isFetchingAccountInfo: false,
  fetchAccountInfoError: null,
  isFetchingTransactions: false,
  fetchTransactionsError: null,
};

export default function channelsReducers(
  state: AccountState = INITIAL_STATE,
  action: any,
): AccountState {
  switch (action.type) {
    case types.GET_ACCOUNT_INFO:
      return {
        ...state,
        account: null,
        isFetchingAccountInfo: true,
        fetchAccountInfoError: null,
      };
    case types.GET_ACCOUNT_INFO_SUCCESS:
      return {
        ...state,
        account: action.payload,
        isFetchingAccountInfo: false,
      };
    case types.GET_ACCOUNT_INFO_FAILURE:
      return {
        ...state,
        fetchAccountInfoError: action.payload,
        isFetchingAccountInfo: false,
      }

    case types.GET_TRANSACTIONS:
      return {
        ...state,
        payments: [],
        invoices: [],
        transactions: [],
        isFetchingAccountInfo: true,
        fetchAccountInfoError: null,
      };
    case types.GET_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        ...action.payload,
        isFetchingTransactions: false,
      };
    case types.GET_TRANSACTIONS_FAILURE:
      return {
        ...state,
        fetchTransactionsError: action.payload,
        isFetchingTransactions: false,
      }
  }

  return state;
}
