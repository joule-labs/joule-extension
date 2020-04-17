import types from './types';
import { Utxo } from 'lnd/message';

export interface OnChainState {
  utxos: Utxo[] | null;
  isFetchingUtxos: boolean;
  fetchUtxosError: null | Error;
}

export const INITIAL_STATE: OnChainState = {
  utxos: null,
  isFetchingUtxos: false,
  fetchUtxosError: null,
};

export default function peersReducers(
  state: OnChainState = INITIAL_STATE,
  action: any,
): OnChainState {
  switch (action.type) {
    case types.GET_UTXOS:
      return {
        ...state,
        isFetchingUtxos: true,
        fetchUtxosError: null,
      };
    case types.GET_UTXOS_SUCCESS:
      return {
        ...state,
        utxos: action.payload,
        isFetchingUtxos: false,
      };
    case types.GET_UTXOS_FAILURE:
      return {
        ...state,
        fetchUtxosError: action.payload,
        isFetchingUtxos: false,
      };
  }
  return state;
}
