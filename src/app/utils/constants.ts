import BitcoinLogo from 'static/images/bitcoin.svg';
import LitecoinLogo from 'static/images/litecoin.svg';
import DecredLogo from 'static/images/decred.svg';
import GroestlcoinLogo from 'static/images/groestlcoin.svg';
import * as React from 'react';
import { CustomIconComponentProps } from 'antd/lib/icon';
import { CHANNEL_STATUS } from 'lib/lnd-http';
import { AddressType } from 'lib/lnd-http/types';

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
  DECRED = 'decred',
  GROESTLCOIN = 'groestlcoin',
  LITECOIN = 'litecoin',
}

export const coinSymbols: { [key in CHAIN_TYPE]: string } = {
  bitcoin: 'BTC',
  decred: 'DCR',
  groestlcoin: 'GRS',
  litecoin: 'LTC',
};

export const blockchainLogos: {
  [key in CHAIN_TYPE]: React.ComponentType<CustomIconComponentProps>
} = {
  bitcoin: BitcoinLogo,
  decred: DecredLogo,
  groestlcoin: GroestlcoinLogo,
  litecoin: LitecoinLogo,
};

export const blockchainDisplayName: { [key in CHAIN_TYPE]: string } = {
  bitcoin: 'Bitcoin',
  decred: 'Decred',
  groestlcoin: 'Groestlcoin',
  litecoin: 'Litecoin',
};

// depositAddressType is the AddressType parameter passed to
// newaddress RPC.
export const depositAddressType: { [key in CHAIN_TYPE]: AddressType } = {
  bitcoin: '0', // p2wkh
  decred: '2', // p2pkh
  groestlcoin: '0', // p2wkh
  litecoin: '0', // p2wkh
};

interface ExplorerUrls {
  mainnet: {
    tx: string;
    block: string;
  };
  testnet: {
    tx: string;
    block: string;
  };
}

export const blockchainExplorers: { [key in CHAIN_TYPE]: ExplorerUrls } = {
  bitcoin: {
    mainnet: {
      tx: 'https://blockstream.info/tx/$TX_ID',
      block: 'https://blockstream.info/block/$BLOCK_ID',
    },
    testnet: {
      tx: 'https://blockstream.info/testnet/tx/$TX_ID',
      block: 'https://blockstream.info/testnet/block/$BLOCK_ID',
    },
  },
  decred: {
    mainnet: {
      tx: 'https://dcrdata.decred.org/tx/$TX_ID',
      block: 'https://dcrdata.decred.org/block/$BLOCK_ID',
    },
    testnet: {
      tx: 'https://testnet.decred.org/tx/$TX_ID',
      block: 'https://testnet.decred.org/block/$BLOCK_ID',
    },
  },
  groestlcoin: {
    mainnet: {
      tx: 'https://chainz.cryptoid.info/grs/tx.dws?$TX_ID',
      block: 'https://chainz.cryptoid.info/grs/block.dws?$BLOCK_ID',
    },
    testnet: {
      tx: 'https://chainz.cryptoid.info/grs-test/tx.dws?$TX_ID',
      block: 'https://chainz.cryptoid.info/grs-test/block.dws?$BLOCK_ID',
    },
  },
  litecoin: {
    mainnet: {
      tx: 'https://blockchair.com/litecoin/transaction/$TX_ID',
      block: 'https://blockchair.com/litecoin/block/$BLOCK_ID',
    },
    testnet: {
      tx: 'https://chain.so/tx/LTCTEST/$TX_ID',
      block: 'https://chain.so/block/LTCTEST/$BLOCK_ID',
    },
  },
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
  decred: {
    SATOSHIS: 'atoms',
    BITS: 'μDCR',
    MILLIBITCOIN: 'mDCR',
    BITCOIN: 'DCR',
  },
  groestlcoin: {
    SATOSHIS: 'gros',
    BITS: 'groestls',
    MILLIBITCOIN: 'mGRS',
    BITCOIN: 'GRS',
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
  decred: {
    SATOSHIS: 'Atoms',
    BITS: 'Microdecred',
    MILLIBITCOIN: 'Millidecred',
    BITCOIN: 'Decred',
  },
  groestlcoin: {
    SATOSHIS: 'Gros',
    BITS: 'Microgroestlcoin',
    MILLIBITCOIN: 'Milligroestlcoin',
    BITCOIN: 'Groestlcoin',
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
// Decred prefixes are defined at
// https://github.com/decred/dcrlnd/blob/b8ddbacb97173797d2b8c2dba081fe70e0136a8d/zpay32/invoice.go#L74-L81
export const CHAIN_PREFIXES = [
  'bc', // Bitcoin Mainnet
  'tb', // Bitcoin Testnet
  'bcrt', // Bitcoin Regtest
  'sb', // Bitcoin Simnet
  'dcr', // Decred Mainnet
  'tdcr', // Decred Testnet
  'sdcr', // Decred Simnet
  'rdcr', // Decred Regnet
  'grs', // Groestlcoin Mainnet
  'tgrs', // Groestlcoin Testnet
  'grsrt', // Groestlcoin Regtest
  'ltc', // Litecoin Mainnet
  'tltc', // Litecoin Testnet
  'rltc', // Litecoin Regtest
];
