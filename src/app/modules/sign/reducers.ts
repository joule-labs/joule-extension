import types from './types';
import { SignMessageResponse } from 'webln';

export interface SignState {
  signReceipt: SignMessageResponse | null;
  signError: null | Error;
  verifyPubkey: string | null;
  verifyAlias: string | null;
  verifyError: null | Error;
}

export const INITIAL_STATE: SignState = {
  signReceipt: null,
  signError: null,
  verifyPubkey: null,
  verifyAlias: null,
  verifyError: null,
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

    case types.VERIFY_MESSAGE:
      return {
        ...state,
        verifyError: null,
      };
    case types.VERIFY_MESSAGE_VALID:
      return {
        ...state,
        verifyPubkey: action.payload.pubkey,
        verifyAlias: action.payload.alias,
      };
    case types.VERIFY_MESSAGE_INVALID:
      return {
        ...state,
        verifyPubkey: action.payload.pubkey,
        verifyAlias: action.payload.alias,
        verifyError: new Error('The signature is not valid'),
      };
    case types.VERIFY_MESSAGE_FAILURE:
      return {
        ...state,
        verifyError: action.payload,
      };
  }
  return state;
}
