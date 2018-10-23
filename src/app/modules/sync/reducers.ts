import types from './types';

export interface SyncState {
  isSyncing: boolean;
  hasSynced: boolean;
}

export const INITIAL_STATE: SyncState = {
  isSyncing: false,
  hasSynced: false,
};

export default function syncReducers(
  state: SyncState = INITIAL_STATE,
  action: any
): SyncState {
  switch (action.type) {
    case types.START_SYNC:
      return {
        ...state,
        isSyncing: true,
      };
    
    case types.FINISH_SYNC:
      return {
        ...state,
        isSyncing: false,
        hasSynced: true,
      };
  }

  return state;
}
