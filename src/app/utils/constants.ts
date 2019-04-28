import BitcoinLogo from 'static/images/bitcoin.svg';
import LitecoinLogo from 'static/images/litecoin.svg';
import * as React from 'react';
import { CustomIconComponentProps } from 'antd/lib/icon';
import { CHANNEL_STATUS } from 'lib/lnd-http';

export enum NODE_TYPE {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  LIGHTNING_APP = 'LIGHTNING_APP',
  ZAP_DESKTOP = 'ZAP_DESKTOP',
  BTCPAY_SERVER = 'BTCPAY_SERVER',
}

export const DEFAULT_NODE_URLS = {
  [NODE_TYPE.LOCAL]: 'https://localhost:8080',
  [NODE_TYPE.LIGHTNING_APP]: 'https://localhost:8086',
  [NODE_TYPE.ZAP_DESKTOP]: 'https://localhost:8180',
} as { [key in NODE_TYPE]: string | undefined };

interface LndDirectories {
  MACOS: string;
  LINUX: string;
  WINDOWS: string;
}

export const DEFAULT_LND_DIRS = {
  [NODE_TYPE.LOCAL]: {
    MACOS: '~/Library/Application Support/Lnd/data/chain/*',
    LINUX: '~/.lnd/data/chain/*',
    WINDOWS: '%APPDATA%\\Lnd\\data\\chain\\*',
  },
  [NODE_TYPE.LIGHTNING_APP]: {
    MACOS: '~/Library/Application Support/lightning-app/lnd/data/chain/*',
    LINUX: '~/.config/lightning-app/lnd/data/chain/*',
    WINDOWS: '%APPDATA%\\Roaming\\lightning-app\\lnd\\data\\chain\\*',
  },
  [NODE_TYPE.ZAP_DESKTOP]: {
    MACOS: '~/Library/Application Support/Zap/lnd/bitcoin/*',
    LINUX: '~/.config/Zap/lnd/data/chain/*',
    WINDOWS: '%APPDATA%\\Roaming\\Zap\\lnd\\data\\chain\\*',
  },
} as { [key in NODE_TYPE]: LndDirectories | undefined };

export enum CHAIN_TYPE {
  BITCOIN = 'bitcoin',
  LITECOIN = 'litecoin',
}

export const coinSymbols: { [key in CHAIN_TYPE]: string } = {
  bitcoin: 'BTC',
  litecoin: 'LTC',
};

export const blockchainLogos: {
  [key in CHAIN_TYPE]: React.ComponentType<CustomIconComponentProps>
} = {
  bitcoin: BitcoinLogo,
  litecoin: LitecoinLogo,
};

export const blockchainDisplayName: { [key in CHAIN_TYPE]: string } = {
  bitcoin: 'Bitcoin',
  litecoin: 'Litecoin',
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
  RUB = 'RUB',
}

export const fiatSymbols: { [key in Fiat]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  RUB: '₽',
};

export const channelStatusText: { [key in CHANNEL_STATUS]: string } = {
  [CHANNEL_STATUS.OPEN]: 'Open',
  [CHANNEL_STATUS.OPENING]: 'Opening',
  [CHANNEL_STATUS.CLOSING]: 'Closing',
  [CHANNEL_STATUS.WAITING]: 'Closing',
  [CHANNEL_STATUS.FORCE_CLOSING]: 'Closing',
};

// Currency prefixes came from
// https://github.com/satoshilabs/slips/blob/master/slip-0173.md
export const CHAIN_PREFIXES = [
  'bc', // Bitcoin Mainnet
  'tb', // Bitcoin Testnet
  'bcrt', // Bitcoin Regtest
  'sb', // Bitcoin Simnet
  'ltc', // Litecoin Mainnet
  'tltc', // Litecoin Testnet
  'rltc', // Litecoin Regtest
];
