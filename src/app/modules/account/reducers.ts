import types, { Account, LightningPaymentWithToNode } from './types';
import { LightningInvoice, ChainTransaction } from 'lib/lnd-http';

export interface AccountState {
  account: Account | null;
  payments: LightningPaymentWithToNode[] | null;
  invoices: LightningInvoice[] | null;
  transactions: ChainTransaction[] | null;
  depositAddress: string | null;
  isFetchingAccountInfo: boolean;
  fetchAccountInfoError: null | Error;
  isFetchingTransactions: boolean;
  fetchTransactionsError: null | Error;
  isFetchingDepositAddress: boolean;
  fetchDepositAddressError: null | Error;
}

export const INITIAL_STATE: AccountState = {
  account: null,
  payments: null,
  invoices: null,
  transactions: null,
  depositAddress: null,
  isFetchingAccountInfo: false,
  fetchAccountInfoError: null,
  isFetchingTransactions: false,
  fetchTransactionsError: null,
  isFetchingDepositAddress: false,
  fetchDepositAddressError: null,
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
      };

    case types.GET_TRANSACTIONS:
      return {
        ...state,
        payments: [],
        invoices: [],
        transactions: [],
        isFetchingTransactions: true,
        fetchTransactionsError: null,
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
      };

    case types.GET_DEPOSIT_ADDRESS:
      return {
        ...state,
        depositAddress: null,
        fetchDepositAddressError: null,
        isFetchingDepositAddress: true,
      };
    case types.GET_DEPOSIT_ADDRESS_SUCCESS:
      return {
        ...state,
        depositAddress: action.payload,
        isFetchingDepositAddress: true,
      };
    case types.GET_DEPOSIT_ADDRESS_FAILURE:
      return {
        ...state,
        fetchDepositAddressError: action.payload,
        isFetchingDepositAddress: false,
      };
  }

  return state;
}
