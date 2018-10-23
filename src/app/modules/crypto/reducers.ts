import types from './types';

export interface CryptoState {
  salt: null | string;
  hasSetPassword: boolean;
  password: null | string;
  testCipher: null | string;
}

export const INITIAL_STATE: CryptoState = {
  salt: null,
  hasSetPassword: false,
  password: null,
  testCipher: null,
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
  }

  return state;
}
