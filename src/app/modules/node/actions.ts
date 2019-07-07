import LndHttpClient, { Macaroon } from 'lib/lnd-http';
import {
  selectSyncedUnencryptedNodeState,
  selectSyncedEncryptedNodeState,
} from './selectors';
import types from './types';

export function checkNode(url: string) {
  return {
    type: types.CHECK_NODE,
    payload: url,
  };
}

export function checkNodes(urls: string[]) {
  return {
    type: types.CHECK_NODES,
    payload: urls,
  };
}

export function checkAuth(url: string, admin: Macaroon, readonly: Macaroon) {
  return {
    type: types.CHECK_AUTH,
    payload: {
      url,
      admin,
      readonly,
    },
  };
}

export function updateNodeUrl(url: string) {
  return {
    type: types.UPDATE_NODE_URL,
    payload: url,
  };
}

export function updateMacaroons(url: string, admin: Macaroon, readonly: Macaroon) {
  return {
    type: types.UPDATE_MACAROONS,
    payload: {
      url,
      admin,
      readonly,
    },
  };
}

export function getNodeInfo() {
  return { type: types.GET_NODE_INFO };
}

export function setNode(
  url: string,
  adminMacaroon: Macaroon,
  readonlyMacaroon: Macaroon,
) {
  return {
    type: types.SET_NODE,
    payload: {
      url,
      adminMacaroon,
      readonlyMacaroon,
      lib: new LndHttpClient(url, adminMacaroon),
    },
  };
}

export function resetNode() {
  return { type: types.RESET_NODE };
}

export function setSyncedUnencryptedNodeState(
  payload: ReturnType<typeof selectSyncedUnencryptedNodeState>,
) {
  const { url, readonlyMacaroon } = payload;
  return {
    type: types.SYNC_UNENCRYPTED_NODE_STATE,
    payload: {
      url,
      readonlyMacaroon,
      lib: url ? new LndHttpClient(url as string, readonlyMacaroon as string) : null,
    },
  };
}

export function setSyncedEncryptedNodeState(
  payload: ReturnType<typeof selectSyncedEncryptedNodeState>,
) {
  const { url, adminMacaroon } = payload;
  return {
    type: types.SYNC_UNENCRYPTED_NODE_STATE,
    payload: {
      url,
      adminMacaroon,
      lib: url ? new LndHttpClient(url as string, adminMacaroon as string) : null,
    },
  };
}
