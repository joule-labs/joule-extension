import { validateMnemonic } from 'bip39';

export function isValidMnemonic(mnemonic: string) {
  return validateMnemonic(mnemonic);
}