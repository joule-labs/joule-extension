import { validateMnemonic } from 'bip39';
import BN from 'bn.js';
import { CHAIN_PREFIXES } from './constants';

export function isValidMnemonic(mnemonic: string) {
  return validateMnemonic(mnemonic);
}

export function isValidPaymentReq(paymentReq: string) {
  // must start with 'ln'
  if (!paymentReq.startsWith('ln')) return false;

  // skip 'ln and grab the next 4 chars to match
  const chain = paymentReq.substring(2, 6);

  // check if the invoice starts with one of the prefixes
  return CHAIN_PREFIXES.some(p => chain.substring(0, p.length) === p);
}

export function isValidConnectAddress(address: string) {
  return !!address.match(/^[0-9a-gA-G]*@.*$/);
}

export function isPossibleDust(amount: string, address: string, fee: number): boolean {
  return address && amount && fee // we need all of these values
    ? estimateTransactionSize(address) // get the estimated tx size
        .mul(new BN(fee)) // multiply it by the fee (sats/B)
        .gte(new BN(amount)) // is the result >= amount
    : false;
}

export function estimateTransactionSize(address: string): BN {
  // Try to get a basic estimate of an onchain tx
  // References:
  // https://github.com/bitcoin/bitcoin/blob/bccb4d29a8080bf1ecda1fc235415a11d903a680/src/policy/policy.cpp#L18
  // https://bitcointalk.org/index.php?topic=1782523.msg17777814#msg17777814

  // assume only one input for now
  // TODO: receive current utxos from LND api to calculate # of inputs
  const numInputs = 1;
  // since we're sending to one address, there should be 2 outputs,
  // one to the recipient and one for change
  const numOutputs = 2;
  // there's 10 bytes of overhead per tx
  const overhead = 10;

  // estimate the number of bytes based on if its segwit or not
  // hardcoded numbers are from the bitcoind source code, which
  // are also referenced many other places online
  const txNumBytes = isSegwitAddress(address)
    ? 67 * numInputs + 31 * numOutputs + overhead
    : 148 * numInputs + 34 * numOutputs + overhead;

  return new BN(txNumBytes);
}

export function isSegwitAddress(address: string): boolean {
  // Detect segwit address based on prefix
  // Ref: https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#examples

  if (!address) {
    return false;
  }

  const addrPrefix = address.split('1')[0] || '';

  // check if the address starts with one of the prefixes
  return CHAIN_PREFIXES.some(p => addrPrefix.substring(0, p.length) === p);
}
