import types from './types';

export function signMessage(message: string) {
  return { 
    type: types.SIGN_MESSAGE,
    payload: message
  };
}
