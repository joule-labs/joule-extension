// tslint:disable no-empty-interface
import { combineReducers } from 'redux';
import crypto, { CryptoState, INITIAL_STATE as cryptoInitialState } from 'modules/crypto';
import sync, { SyncState, INITIAL_STATE as syncInitialState } from 'modules/sync';
import node, { NodeState, INITIAL_STATE as nodeInitialState } from 'modules/node';

export interface AppState {
  crypto: CryptoState;
  sync: SyncState;
  node: NodeState;
}

export const combineInitialState: Partial<AppState> = {
  crypto: cryptoInitialState,
  sync: syncInitialState,
  node: nodeInitialState,
};

export default combineReducers<AppState>({
  crypto,
  sync,
  node,
});
