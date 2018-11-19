import types from './types';
import { RatesState } from './reducers';

export function fetchRates() {
  return { type: types.FETCH_RATES };
}

export function setRates(rates: RatesState['rates']) {
  return {
    type: types.SET_RATES,
    payload: rates,
  };
}