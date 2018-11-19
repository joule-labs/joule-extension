import { SagaIterator } from 'redux-saga';
import { takeLatest, call, put } from 'redux-saga/effects';
import { Fiat } from 'utils/constants';
import { fetchRates } from './actions';
import { apiFetchRates } from 'lib/cryptocompare';
import types from './types';

export function* handleFetchRates(): SagaIterator {
  try {
    const fiats = Object.keys(Fiat);
    const rates = yield call(apiFetchRates, 'BTC', fiats);
    yield put({ type: types.FETCH_RATES_SUCCESS, payload: rates });
  } catch(err) {
    yield put({ type: types.FETCH_RATES_FAILURE, payload: err });
  }
}

export default function* channelsSagas(): SagaIterator {
  yield takeLatest(types.FETCH_RATES, handleFetchRates);
  // Kick one off initially
  yield put(fetchRates());
}
