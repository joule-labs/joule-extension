import LndHttpClient, { Macaroon } from 'lib/lnd-http';
import {
  selectSyncedUnencryptedNodeState,
  selectSyncedEncryptedNodeState,
  selectSyncedUnencryptedLoopState,
} from './selectors';
import types from './types';
import LoopHttpClient from 'lib/loop-http';

export function checkNode(url: string) {
  return {
    type: types.CHECK_NODE,
    payload: url,
  };
}

export function checkNodes(urls: string[], loopUrl: string[]) {
  return {
    type: types.CHECK_NODES,
    payload: urls,
    loopUrl,
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

export function updateMacaroons(
  url: string,
  loopUrl: string,
  admin: Macaroon,
  readonly: Macaroon,
) {
  return {
    type: types.UPDATE_MACAROONS,
    payload: {
      url,
      loopUrl,
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
  loopUrl: string,
  adminMacaroon: Macaroon,
  readonlyMacaroon: Macaroon,
) {
  return {
    type: types.SET_NODE,
    payload: {
      url,
      loopUrl,
      adminMacaroon,
      readonlyMacaroon,
      lib: new LndHttpClient(url, adminMacaroon),
      loopLib: new LoopHttpClient(loopUrl),
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

export function setSyncedUnencryptedLoopState(
  payload: ReturnType<typeof selectSyncedUnencryptedLoopState>,
) {
  const { loopUrl } = payload;
  return {
    type: types.SYNC_UNENCRYPTED_LOOP_STATE,
    payload: {
      loopUrl,
      loopLib: loopUrl ? new LoopHttpClient(loopUrl as string) : null,
    },
  };
}
