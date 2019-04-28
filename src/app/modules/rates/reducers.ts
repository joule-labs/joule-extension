import { CHAIN_TYPE } from 'utils/constants';
import types, { RatesMap } from './types';

export type Rates = { [key in CHAIN_TYPE]: RatesMap | undefined };

export interface RatesState {
  rates: null | Rates;
  isFetchingRates: boolean;
  fetchRatesError: Error | null;
}

export const INITIAL_STATE: RatesState = {
  rates: null,
  isFetchingRates: false,
  fetchRatesError: null,
};

export default function ratesReducer(
  state: RatesState = INITIAL_STATE,
  action: any,
): RatesState {
  switch (action.type) {
    case types.FETCH_RATES:
      return {
        ...state,
        isFetchingRates: true,
        fetchRatesError: null,
      };
    case types.FETCH_RATES_SUCCESS:
      return {
        ...state,
        rates: action.payload,
        isFetchingRates: false,
      };
    case types.FETCH_RATES_FAILURE:
      return {
        ...state,
        fetchRatesError: action.payload,
        isFetchingRates: false,
      };

    case types.SET_RATES:
      return {
        ...state,
        rates: action.payload,
      };
  }

  return state;
}
