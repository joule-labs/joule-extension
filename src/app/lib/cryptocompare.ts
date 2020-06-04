import { CHAIN_TYPE, coinSymbols } from 'utils/constants';
import { Rates } from 'modules/rates/reducers';

const API_URL = 'https://min-api.cryptocompare.com/data/price';

export function apiFetchRates(coins: string[], tsyms: string[]) {
  const rates: { [key: string]: Rates } = {};
  coins.forEach(async (coin) => {
    const coinSymbol = coinSymbols[coin as CHAIN_TYPE];
    rates[coin] = await fetchRates(coinSymbol, tsyms);
  });

  return rates;
}

function fetchRates(fsym: string, tsyms: string[]) {
  return fetch(`${API_URL}?fsym=${fsym}&tsyms=${tsyms.join(',')}`).then((res) =>
    res.json(),
  );
}
