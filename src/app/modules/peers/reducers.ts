import types, { PeerWithNode } from './types';

export interface PeersState {
  peers: null | PeerWithNode[];
  isFetchingPeers: boolean;
  fetchPeersError: null | Error;
  isAddingPeer: boolean;
  addPeerError: null | Error;
}

export const INITIAL_STATE: PeersState = {
  peers: null,
  isFetchingPeers: false,
  fetchPeersError: null,
  isAddingPeer: false,
  addPeerError: null,
};

export default function peersReducers(
  state: PeersState = INITIAL_STATE,
  action: any,
): PeersState {
  switch (action.type) {
    case types.GET_PEERS:
      return {
        ...state,
        peers: [],
        isFetchingPeers: true,
        fetchPeersError: null,
      };
    case types.GET_PEERS_SUCCESS:
      return {
        ...state,
        peers: action.payload,
        isFetchingPeers: false,
      };
    case types.GET_PEERS_FAILURE:
      return {
        ...state,
        fetchPeersError: action.payload,
        isFetchingPeers: false,
      }

    case types.ADD_PEER:
      return {
        ...state,
        isAddingPeer: true,
        addPeerError: null,
      };
    case types.ADD_PEER_SUCCESS:
      return {
        ...state,
        isAddingPeer: false,
      };
    case types.ADD_PEER_FAILURE:
      return {
        ...state,
        isAddingPeer: false,
        addPeerError: action.payload,
      };
  }

  return state;
}
