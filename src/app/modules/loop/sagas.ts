import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, put } from 'redux-saga/effects';
import { selectLoopLibOrThrow } from 'modules/loop/selectors';
import types from './types';
import * as actions from './actions';
import LoopHttpClient from '../../lib/loop-http';
import { requirePassword } from 'modules/crypto/sagas';

// Setup Loop URL and Loop Terms
export function* handleSetLoopOut(
  action: ReturnType<typeof actions.setLoop>,
): SagaIterator {
  const url = action.payload;
  let loopTermsPayload;
  try {
    const client = new LoopHttpClient(url);
    loopTermsPayload = yield call(client.getLoopOutTerms);
  } catch (err) {
    yield put({ type: types.SET_LOOP_FAILURE, payload: err });
    return;
  }
  yield put({
    type: types.SET_LOOP_SUCCESS,
    payload: url,
  });
  yield put({
    type: types.GET_LOOP_OUT_TERMS_SUCCESS,
    payload: loopTermsPayload,
  });
}

export function* handleSetLoopIn(
  action: ReturnType<typeof actions.setLoopIn>,
): SagaIterator {
  const url = action.payload;
  let loopTermsPayload;
  try {
    const client = new LoopHttpClient(url);
    loopTermsPayload = yield call(client.getLoopInTerms);
  } catch (err) {
    yield put({ type: types.SET_LOOP_IN_FAILURE, payload: err });
    return;
  }
  yield put({
    type: types.SET_LOOP_IN_SUCCESS,
    payload: url,
  });
  yield put({
    type: types.GET_LOOP_IN_TERMS_SUCCESS,
    payload: loopTermsPayload,
  });
}

export function* handleGetLoopOutQuote(
  action: ReturnType<typeof actions.getLoopOutQuote>,
): SagaIterator {
  const amt = action.payload;
  const conf = action.payload;
  let loopLib: Yielded<typeof selectLoopLibOrThrow>;
  let loopQuote: Yielded<typeof loopLib.getLoopOutQuote> | undefined;
  try {
    yield call(requirePassword);
    loopLib = yield select(selectLoopLibOrThrow);
    loopQuote = (yield call(loopLib.getLoopOutQuote, amt, conf)) as Yielded<
      typeof loopLib.getLoopOutQuote
    >;
  } catch (err) {
    yield put({ type: types.GET_LOOP_OUT_QUOTE_FAILURE, payload: err });
    return;
  }
  yield put({
    type: types.GET_LOOP_OUT_QUOTE_SUCCESS,
    payload: loopQuote,
  });
}

export function* handleGetLoopInQuote(
  action: ReturnType<typeof actions.getLoopInQuote>,
): SagaIterator {
  const amt = action.payload;
  /*const conf = action.payload;*/
  let loopLib: Yielded<typeof selectLoopLibOrThrow>;
  let loopQuote: Yielded<typeof loopLib.getLoopInQuote> | undefined;
  try {
    yield call(requirePassword);
    loopLib = yield select(selectLoopLibOrThrow);
    loopQuote = (yield call(loopLib.getLoopInQuote, amt /*, conf*/)) as Yielded<
      typeof loopLib.getLoopInQuote
    >;
  } catch (err) {
    yield put({ type: types.GET_LOOP_IN_QUOTE_FAILURE, payload: err });
    return;
  }
  yield put({
    type: types.GET_LOOP_IN_QUOTE_SUCCESS,
    payload: loopQuote,
  });
}

export function* handleGetLoopOut(
  action: ReturnType<typeof actions.getLoopOut>,
): SagaIterator {
  const payload = action.payload;
  let loopLib: Yielded<typeof selectLoopLibOrThrow>;
  let loopOut: Yielded<typeof loopLib.loopOut> | undefined;
  try {
    loopLib = yield select(selectLoopLibOrThrow);
    loopOut = (yield call(loopLib.loopOut, payload)) as Yielded<typeof loopLib.loopOut>;
  } catch (err) {
    yield put({ type: types.LOOP_OUT_FAILURE, payload: err });
    return;
  }
  yield put({
    type: types.LOOP_OUT_SUCCESS,
    payload: loopOut,
  });
}

export function* handleGetLoopIn(
  action: ReturnType<typeof actions.getLoopIn>,
): SagaIterator {
  const payload = action.payload;
  let loopLib: Yielded<typeof selectLoopLibOrThrow>;
  let loopIn: Yielded<typeof loopLib.loopIn> | undefined;
  try {
    loopLib = yield select(selectLoopLibOrThrow);
    loopIn = (yield call(loopLib.loopIn, payload)) as Yielded<typeof loopLib.loopIn>;
  } catch (err) {
    yield put({ type: types.LOOP_IN_FAILURE, payload: err });
    return;
  }
  yield put({
    type: types.LOOP_IN_SUCCESS,
    payload: loopIn,
  });
}

export default function* loopSagas(): SagaIterator {
  yield takeLatest(types.SET_LOOP, handleSetLoopOut);
  yield takeLatest(types.SET_LOOP_IN, handleSetLoopIn);
  yield takeLatest(types.GET_LOOP_OUT_QUOTE, handleGetLoopOutQuote);
  yield takeLatest(types.GET_LOOP_IN_QUOTE, handleGetLoopInQuote);
  yield takeLatest(types.LOOP_OUT, handleGetLoopOut);
  yield takeLatest(types.LOOP_IN, handleGetLoopIn);
}
