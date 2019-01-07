import types from './types';

export function getPeers() {
  return { type: types.GET_PEERS };
}
