import types from './types';
import settingsTypes from 'modules/settings/types';

export interface CryptoState {
  salt: null | string;
  hasSetPassword: boolean;
  password: null | string;
  testCipher: null | string;
  isRequestingPassword: boolean;
  depositModal: boolean;
}

export const INITIAL_STATE: CryptoState = {
  salt: null,
  hasSetPassword: false,
  password: null,
  testCipher: null,
  isRequestingPassword: false,
  depositModal: false
};

export default function cryptoReducers(
  state: CryptoState = INITIAL_STATE,
  action: any
): CryptoState {
  switch (action.type) {
    case types.GENERATE_SALT:
      return {
        ...state,
        salt: action.payload,
      }

    case types.SET_PASSWORD:
      return {
        ...state,
        hasSetPassword: true,
        password: action.payload,
      };
    
    case types.SET_TEST_CIPHER:
      return {
        ...state,
        testCipher: action.payload,
      };
    
    case types.ENTER_PASSWORD:
      return {
        ...state,
        password: action.payload,
        isRequestingPassword: false,
      };
    
    case types.REQUEST_PASSWORD:
      return {
        ...state,
        isRequestingPassword: true,
        depositModal: true,
      }

    case types.CANCEL_PASSWORD:
      return {
        ...state,
        isRequestingPassword: false,
        depositModal: false,
      };

    case types.LOGOUT:
      return {
        ...state,
        password: null,
      };

    case types.SET_SYNCED_CRYPTO_STATE:
      return {
        ...state,
        ...action.payload,
      };
    
    case settingsTypes.CLEAR_SETTINGS:
      return {
        ...state,
        salt: null,
        hasSetPassword: false,
        password: null,
        testCipher: null,
      }
  }

  return state;
}
