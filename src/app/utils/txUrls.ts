/**
 * Return tx info URL based on testnet state and chain
 * @param {string} chain - bitcoin, litecoin, etc.
 * @param {boolean} isTestnet - testnet flag set to 1 or 0
 * @returns {object} urls associated with chain
 */
export default function txUrls(chain: string, isTestnet: boolean | '') {
  const mainnet: any = {
    bitcoin: {
      blockUrl: 'https://blockstream.info/block/',
      txUrl: 'https://blockstream.info/tx/',
    },
    litecoin: {
      blockUrl: 'https://live.blockcypher.com/ltc/block/',
      txUrl: 'https://live.blockcypher.com/ltc/tx/',
    },
  };
  const testnet: any = {
    bitcoin: {
      blockUrl: 'https://blockstream.info/testnet/block/',
      txUrl: 'https://blockstream.info/testnet/tx/',
    },
    litecoin: {
      blockUrl: 'https://chain.so/block/LTC/',
      txUrl: 'https://chain.so/tx/LTC/',
    },
  };
  if (isTestnet) {
    return testnet[`${chain}`];
  } else {
    return mainnet[`${chain}`];
  }
}
