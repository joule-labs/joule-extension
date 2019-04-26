import types from './types';

export function getUtxos() {
  return {
    type: types.GET_UTXOS,
  };
}
