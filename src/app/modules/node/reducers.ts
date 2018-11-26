import LndHttpClient, { Macaroon, GetInfoResponse } from 'lib/lnd-http';
import types from './types';
import settingsTypes from 'modules/settings/types';

export interface NodeState {
  lib: LndHttpClient | null;
  url: string | null;
  isNodeChecked: boolean;
  adminMacaroon: Macaroon | null;
  readonlyMacaroon: Macaroon | null;
  nodeInfo: GetInfoResponse | null;

  isCheckingNode: boolean;
  checkNodeError: null | Error;
  isCheckingAuth: boolean;
  checkAuthError: null | Error;
  isFetchingNodeInfo: boolean;
  fetchNodeInfoError: null | Error;
}

export const INITIAL_STATE: NodeState = {
  lib: null,
  url: null,
  isNodeChecked: false,
  adminMacaroon: null,
  readonlyMacaroon: null,
  nodeInfo: null,

  isCheckingNode: false,
  checkNodeError: null,
  isCheckingAuth: false,
  checkAuthError: null,
  isFetchingNodeInfo: false,
  fetchNodeInfoError: null,
};

export default function cryptoReducers(
  state: NodeState = INITIAL_STATE,
  action: any
): NodeState {
  switch (action.type) {
    case types.CHECK_NODE:
      return {
        ...state,
        url: null,
        isNodeChecked: false,
        isCheckingNode: true,
        checkNodeError: null,
        checkAuthError: null,
      };
    case types.CHECK_NODE_SUCCESS:
      return {
        ...state,
        url: action.payload,
        isNodeChecked: true,
        isCheckingNode: false,
      };
    case types.CHECK_NODE_FAILURE:
      return {
        ...state,
        isCheckingNode: false,
        checkNodeError: action.payload,
      };
    
    case types.CHECK_AUTH:
      return {
        ...state,
        isCheckingAuth: true,
        checkAuthError: null,
      };
    case types.CHECK_AUTH_SUCCESS:
      return {
        ...state,
        url: action.payload.url,
        nodeInfo: action.payload.response,
        isCheckingAuth: false,
      };
    case types.CHECK_AUTH_FAILURE:
      return {
        ...state,
        isCheckingAuth: false,
        checkAuthError: action.payload,
      };
    
    case types.GET_NODE_INFO:
      return {
        ...state,
        nodeInfo: null,
        isFetchingNodeInfo: true,
        fetchNodeInfoError: null,
      };
    case types.GET_NODE_INFO_SUCCESS:
      return {
        ...state,
        isFetchingNodeInfo: false,
        nodeInfo: action.payload,
      };
    case types.GET_NODE_INFO_FAILURE:
      return {
        ...state,
        isFetchingNodeInfo: false,
        fetchNodeInfoError: action.payload,
      }
    
    case types.SET_NODE:
    case types.SYNC_UNENCRYPTED_NODE_STATE:
    case types.SYNC_ENCRYPTED_NODE_STATE:
      return {
        ...state,
        ...action.payload,
      };

    case types.RESET_NODE:
      return { ...INITIAL_STATE };
    
    case settingsTypes.CLEAR_SETTINGS:
      return {
        ...state,
        lib: null,
        url: null,
        readonlyMacaroon: null,
        adminMacaroon: null,
      };
  }

  return state;
}
