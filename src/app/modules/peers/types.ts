import { Peer, LightningNode } from 'lib/lnd-http';

enum PeersTypes {
  GET_PEERS = 'GET_PEERS_INFO',
  GET_PEERS_SUCCESS = 'GET_PEERS_SUCCESS',
  GET_PEERS_FAILURE = 'GET_PEERS_FAILURE',
}

export interface PeerWithNode extends Peer {
  node: LightningNode;
}

export default PeersTypes;
