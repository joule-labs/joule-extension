import { Peer, LightningNode } from 'lnd/message';

enum PeersTypes {
  GET_PEERS = 'GET_PEERS_INFO',
  GET_PEERS_SUCCESS = 'GET_PEERS_SUCCESS',
  GET_PEERS_FAILURE = 'GET_PEERS_FAILURE',

  ADD_PEER = 'ADD_PEER',
  ADD_PEER_SUCCESS = 'ADD_PEER_SUCCESS',
  ADD_PEER_FAILURE = 'ADD_PEER_FAILURE',
}

export interface PeerWithNode extends Peer {
  node: LightningNode;
}

export default PeersTypes;
