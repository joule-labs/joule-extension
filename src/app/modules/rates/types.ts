import { Fiat } from 'utils/constants';

enum RatesTypes {
  FETCH_RATES = 'FETCH_RATES',
  FETCH_RATES_SUCCESS = 'FETCH_RATES_SUCCESS',
  FETCH_RATES_FAILURE = 'FETCH_RATES_FAILURE',

  SET_RATES = 'SET_RATES',
}

export type RatesMap = { [key in Fiat]: number };

export default RatesTypes;
