import { takeLatest, call, put } from 'typed-redux-saga';
import { CHAIN_TYPE, Fiat } from 'utils/constants';
import { fetchRates } from './actions';
import { apiFetchRates } from 'lib/cryptocompare';
import types from './types';

export function* handleFetchRates() {
  try {
    const fiats = Object.keys(Fiat);
    const coins = Object.values(CHAIN_TYPE);
    const rates = yield* call(apiFetchRates, coins, fiats);
    yield put({ type: types.FETCH_RATES_SUCCESS, payload: rates });
  } catch (err) {
    yield put({ type: types.FETCH_RATES_FAILURE, payload: err });
  }
}

export default function* channelsSagas() {
  yield takeLatest(types.FETCH_RATES, handleFetchRates);
  // Kick one off initially
  yield put(fetchRates());
}
