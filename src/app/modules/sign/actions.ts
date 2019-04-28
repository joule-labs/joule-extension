import types from './types';

export function signMessage(message: string) {
  return {
    type: types.SIGN_MESSAGE,
    payload: message,
  };
}

export function verifyMessage(signature: string, msg: string) {
  return {
    type: types.VERIFY_MESSAGE,
    payload: {
      signature,
      msg,
    },
  };
}
