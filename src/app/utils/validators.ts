import { validateMnemonic } from 'bip39';

export function isValidMnemonic(mnemonic: string) {
  return validateMnemonic(mnemonic);
}

export function isValidPaymentReq(paymentReq: string) {
  // must start with 'ln'
  if (!paymentReq.startsWith('ln')) return false;

  // Currency prefixes came from 
  // https://github.com/satoshilabs/slips/blob/master/slip-0173.md
  const prefixes = [
    'bc',   // Bitcoin Mainnet
    'tb',   // Bitcoin Testnet
    'bcrt', // Bitcoin Regtest
    'sb',   // Bitcoin Simnet
    'ltc',  // Litecoin Mainnet
    'tltc', // Litecoin Testnet
    'rltc', // Litecoin Regtest
  ]

  // skip 'ln and grab the next 4 chars to match
  const chain = paymentReq.substring(2, 6);
  // check if the invoice starts with one of the prefixes
  return prefixes.some(p => chain.substring(0, p.length) === p);
}

export function isValidConnectAddress(address: string) {
  return !!address.match(/^[0-9a-gA-G]*@.*$/);
}
