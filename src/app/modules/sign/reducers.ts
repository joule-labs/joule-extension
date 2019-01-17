import types from './types';
import { SignMessageResponse } from 'webln/lib/provider';

export interface SignState {
  signReceipt: SignMessageResponse | null;
  signError: null | Error;
}

export const INITIAL_STATE: SignState = {
  signReceipt: null,
  signError: null,
};

export default function peersReducers(
  state: SignState = INITIAL_STATE,
  action: any,
): SignState {
  switch (action.type) {
    case types.SIGN_MESSAGE:
      return {
        ...state,
        signReceipt: null,
        signError: null,
      };
    case types.SIGN_MESSAGE_SUCCESS:
      return {
        ...state,
        signReceipt: action.payload,
      };
    case types.SIGN_MESSAGE_FAILURE:
      return {
        ...state,
        signReceipt: null,
        signError: action.payload,
      };
  }
  return state;
}
