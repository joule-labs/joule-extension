import { AppState } from 'store/reducers';

export const selectSyncedNodeState = (s: AppState) => ({
  url: s.node.url,
  macaroon: s.node.macaroon,
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