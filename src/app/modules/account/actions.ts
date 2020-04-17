import { NewAddressArguments } from 'lnd/message';
import types from './types';

export function getAccountInfo() {
  return { type: types.GET_ACCOUNT_INFO };
}

export function getTransactions() {
  return { type: types.GET_TRANSACTIONS };
}

export function getDepositAddress(payload: NewAddressArguments) {
  return {
    type: types.GET_DEPOSIT_ADDRESS,
    payload,
  };
}
