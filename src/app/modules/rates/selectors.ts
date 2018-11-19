import { AppState as S } from 'store/reducers';

export const selectRates = (s: S) => s.rates.rates;
