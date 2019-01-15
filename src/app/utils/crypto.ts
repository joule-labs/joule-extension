import { AES, enc } from 'crypto-js';

export const TEST_CIPHER_DATA = 'Howdy partner!';

export function encryptData(data: any, password: string, salt: string) {
  return AES.encrypt(JSON.stringify(data), password + salt).toString();
}

export function decryptData(cipher: any, password: string, salt: string) {
  const decrypted = AES.decrypt(cipher, password + salt);
  return JSON.parse(decrypted.toString(enc.Utf8));
}
