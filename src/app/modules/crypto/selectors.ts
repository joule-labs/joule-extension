import { AppState as S } from 'store/reducers';

export const selectSalt = (s: S) => s.crypto.salt;
export const selectPassword = (s: S) => s.crypto.password;
export const selectHasSetPassword = (s: S) => s.crypto.hasSetPassword;
export const selectTestCipher = (s: S) => s.crypto.testCipher;

export const selectSyncedCryptoState = (s: S) => ({
  salt: selectSalt(s),
  hasSetPassword: selectHasSetPassword(s),
  testCipher: selectTestCipher(s),
});