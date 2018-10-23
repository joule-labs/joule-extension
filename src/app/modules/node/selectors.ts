import { AppState } from 'store/reducers';

export const selectSyncedNodeState = (s: AppState) => ({
  url: s.node.url,
  macaroon: s.node.macaroon,
});
