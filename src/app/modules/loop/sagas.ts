import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, put } from 'redux-saga/effects';
import { selectLoopLibOrThrow } from 'modules/node/selectors';
import types from './types';

export function* handleGetLoopTerms(): SagaIterator {
  try {
    const loopLib = yield select(selectLoopLibOrThrow);
    const payload = yield call(loopLib.getLoopTerms);
    yield put({
      type: types.GET_LOOP_TERMS_SUCCESS,
      payload,
    });
  } catch (err) {
    yield put({
      type: types.GET_LOOP_TERMS_FAILURE,
      payload: err,
    });
  }
}

export default function* loopSagas(): SagaIterator {
  yield takeLatest(types.GET_LOOP_TERMS, handleGetLoopTerms);
}
