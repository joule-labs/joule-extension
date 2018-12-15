export const DEFAULT_LOCAL_NODE_URLS = [
  'https://localhost:8080',
  'https://localhost:8086'
];

export const LND_DIR = {
  MACOS: '~/Library/Application Support/Lnd/data/chain/bitcoin/*',
  LINUX: '~/.lnd/data/chain/bitcoin/*',
};

export enum Denomination {
  SATOSHIS = 'SATOSHIS',
  MILLIBITCOIN = 'MILLIBITCOIN',
  BITS = 'BITS',
  BITCOIN = 'BITCOIN',
}

export const denominationSymbols: { [key in Denomination]: string } = {
  SATOSHIS: 'sats',
  BITS: 'bits',
  MILLIBITCOIN: 'mBTC',
  BITCOIN: 'BTC',
};

export const denominationNames: { [key in Denomination]: string } = {
  SATOSHIS: 'Satoshis',
  BITS: 'Microbitcoin',
  MILLIBITCOIN: 'Millibitcoin',
  BITCOIN: 'Bitcoin',
};

export enum Fiat {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
}

export const fiatSymbols: { [key in Fiat]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};
