import types from './types';

export function getPeers() {
  return { type: types.GET_PEERS };
}

export function addPeer(address: string) {
  return {
    type: types.ADD_PEER,
    payload: address,
  };
}