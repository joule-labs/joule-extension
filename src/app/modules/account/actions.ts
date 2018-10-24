import types from './types';

export function getAccountInfo() {
  return { type: types.GET_ACCOUNT_INFO };
}

export function getTransactions() {
  return { type: types.GET_TRANSACTIONS };
}