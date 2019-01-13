import { AppState } from 'store/reducers';

export const selectSyncedUnencryptedNodeState = (s: AppState) => ({
  url: s.node.url,
  readonlyMacaroon: s.node.readonlyMacaroon,
});

export const selectSyncedEncryptedNodeState = (s: AppState) => ({
  url: s.node.url,
  adminMacaroon: s.node.adminMacaroon,
});

export const selectNodeLib = (s: AppState) => s.node.lib;
export const selectNodeLibOrThrow = (s: AppState) => {
  const lib = selectNodeLib(s);
  if (!lib) {
    throw new Error('Node must be configured first');
  }
  return lib;
};

export const selectNodeInfo = (s: AppState) => s.node.nodeInfo;