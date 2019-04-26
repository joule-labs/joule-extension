import { AppState as S } from 'store/reducers';
import { getNodeChain } from 'modules/node/selectors';

export const selectRates = (s: S) => s.rates.rates;
export const getChainRates = (s: S) => {
  const chain = getNodeChain(s);
  const rates = selectRates(s);
  return rates && rates[chain] ? rates[chain] : null;
};
