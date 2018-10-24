import LndHttpClient, { Macaroon } from 'lib/lnd-http';
import types from './types';

export function checkNode(url: string) {
  return {
    type: types.CHECK_NODE,
    payload: url,
  };
}

export function checkAuth(url: string, macaroon: Macaroon) {
  return {
    type: types.CHECK_AUTH,
    payload: {
      url,
      macaroon,
    },
  };
}

export function getNodeInfo() {
  return { type: types.GET_NODE_INFO };
}

export function setNode(url: string, macaroon: Macaroon) {
  return {
    type: types.SET_NODE,
    payload: {
      url,
      macaroon,
      lib: new LndHttpClient(url, macaroon),
    },
  };
}

export function resetNode() {
  return { type: types.RESET_NODE };
}

export function setSyncedNodeState(payload: ReturnType<typeof selectSyncedNodeState>) {
  const { url, macaroon } = payload;
  return {
    type: types.SYNC_NODE_STATE,
    payload: {
      url,
      macaroon,
      lib: new LndHttpClient(url, macaroon),
    },
  }
}