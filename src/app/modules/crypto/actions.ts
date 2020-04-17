import types from './types';
import { selectSyncedCryptoState } from './selectors';

export function generateSalt() {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  array = array.map(x => validChars.charCodeAt(x % validChars.length));
  const salt = String.fromCharCode.apply(null, array as any);

  return {
    type: types.GENERATE_SALT,
    payload: salt,
  };
}

export function setPassword(payload: string) {
  return {
    type: types.SET_PASSWORD,
    payload,
  };
}

export function setTestCipher(payload: string) {
  return {
    type: types.SET_TEST_CIPHER,
    payload,
  };
}

export function enterPassword(password: string, save: boolean = false) {
  return {
    type: types.ENTER_PASSWORD,
    payload: {
      password,
      save,
    },
  };
}

export function requestPassword() {
  return { type: types.REQUEST_PASSWORD };
}

export function cancelPassword() {
  return { type: types.CANCEL_PASSWORD };
}

export function changePassword(newPassword: string, currPassword: string) {
  return {
    type: types.CHANGE_PASSWORD,
    payload: {
      currPassword,
      newPassword,
    },
  };
}

export function logout() {
  return { type: types.LOGOUT };
}

export function setSyncedCryptoState(
  payload: ReturnType<typeof selectSyncedCryptoState>,
) {
  return {
    type: types.SET_SYNCED_CRYPTO_STATE,
    payload,
  };
}
