import BitcoinLogo from 'static/images/bitcoin.svg';
import LitecoinLogo from 'static/images/litecoin.svg';
import * as React from 'react';
import { CustomIconComponentProps } from 'antd/lib/icon';

export const DEFAULT_LOCAL_NODE_URLS = [
  'https://localhost:8080',
  'https://localhost:8086'
];

export const LND_DIR = {
  MACOS: '~/Library/Application Support/Lnd/data/chain/bitcoin/*',
  LINUX: '~/.lnd/data/chain/bitcoin/*',
};

export enum CHAIN_TYPE {
  BITCOIN = 'bitcoin',
  LITECOIN = 'litecoin',
}

export const coinSymbols: { [key in CHAIN_TYPE]: string } = {
  bitcoin: 'BTC',
  litecoin: 'LTC'
};

export const blockchainLogos: { [key in CHAIN_TYPE]: React.ComponentType<CustomIconComponentProps> } = {
  bitcoin: BitcoinLogo,
  litecoin: LitecoinLogo,
};

export const blockchainDisplayName: { [key in CHAIN_TYPE]: string } = {
  bitcoin: 'Bitcoin',
  litecoin: 'Litecoin'
};

export enum Denomination {
  SATOSHIS = 'SATOSHIS',
  MILLIBITCOIN = 'MILLIBITCOIN',
  BITS = 'BITS',
  BITCOIN = 'BITCOIN',
}

export type DenominationMap = { [key in Denomination]: string };

export const denominationSymbols: { [key in CHAIN_TYPE]: DenominationMap } = {
  bitcoin: {
    SATOSHIS: 'sats',
    BITS: 'bits',
    MILLIBITCOIN: 'mBTC',
    BITCOIN: 'BTC',
  },
  litecoin: {
    SATOSHIS: 'lits',
    BITS: 'mł',
    MILLIBITCOIN: 'ł',
    BITCOIN: 'Ł',
  },
};

export const denominationNames: { [key in CHAIN_TYPE]: DenominationMap } = {
  bitcoin: {
    SATOSHIS: 'Satoshis',
    BITS: 'Microbitcoin',
    MILLIBITCOIN: 'Millibitcoin',
    BITCOIN: 'Bitcoin',
  },
  litecoin: {
    SATOSHIS: 'Litoshis',
    BITS: 'Photons',
    MILLIBITCOIN: 'Lites',
    BITCOIN: 'Litecoin',
  },
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
