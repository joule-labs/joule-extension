import types from './types';

export function fetchRates() {
  return { type: types.FETCH_RATES };
}
