import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, put } from 'redux-saga/effects';
import { selectLoopLibOrThrow } from 'modules/loop/selectors';
import types from './types';
import * as actions from './actions';
import LoopHttpClient from '../../lib/loop-http';
import { requirePassword } from 'modules/crypto/sagas';

// Setup Loop URL and make a request to check that it works
export function* handleSetLoopURL(
  action: ReturnType<typeof actions.setLoop>,
): SagaIterator {
  const url = action.payload;
  let loopOutTermsPayload: Yielded<LoopHttpClient['getLoopOutTerms']>;

  try {
    const client = new LoopHttpClient(url);
    loopOutTermsPayload = yield call(client.getLoopOutTerms);
  } catch (err) {
    yield put({ type: types.SET_LOOP_URL_FAILURE, payload: err });
    return;
  }
  yield put({
    type: types.SET_LOOP_URL_SUCCESS,
    payload: url,
  });
  yield put({
    type: types.GET_LOOP_OUT_TERMS_SUCCESS,
    payload: loopOutTermsPayload,
  });
}

// list swap history and status
export function* handleSwaps(): SagaIterator {
  let payload;
  try {
    const loopLib: Yielded<typeof selectLoopLibOrThrow> = yield select(
      selectLoopLibOrThrow,
    );
    const libCall = loopLib.listSwaps;
    payload = (yield call(libCall as any)) as Yielded<typeof libCall>;
  } catch (err) {
    yield put({ type: types.LIST_SWAPS_FAILURE, payload: err });
    return;
  }
  yield put({ type: types.LIST_SWAPS_SUCCESS, payload });
}

export function* handleGetLoopTerms(
  action: ReturnType<typeof actions.getLoopOutQuote | typeof actions.getLoopInQuote>,
): SagaIterator {
  const isOut = action.type === types.GET_LOOP_OUT_TERMS;
  let type;
  let payload;

  try {
    const loopLib: Yielded<typeof selectLoopLibOrThrow> = yield select(
      selectLoopLibOrThrow,
    );
    const libCall = isOut ? loopLib.getLoopOutTerms : loopLib.getLoopInTerms;
    payload = (yield call(libCall, action.payload)) as Yielded<typeof libCall>;
    type = isOut ? types.GET_LOOP_OUT_TERMS_SUCCESS : types.GET_LOOP_IN_TERMS_SUCCESS;
  } catch (err) {
    payload = err;
    type = isOut ? types.GET_LOOP_OUT_TERMS_FAILURE : types.GET_LOOP_IN_TERMS_FAILURE;
  }

  yield put({ type, payload });
}

export function* handleGetLoopQuote(
  action: ReturnType<typeof actions.getLoopOutQuote | typeof actions.getLoopInQuote>,
): SagaIterator {
  const isOut = action.type === types.GET_LOOP_OUT_QUOTE;
  let type;
  let payload;

  try {
    const loopLib: Yielded<typeof selectLoopLibOrThrow> = yield select(
      selectLoopLibOrThrow,
    );
    const libCall = isOut ? loopLib.getLoopOutQuote : loopLib.getLoopInQuote;
    payload = (yield call(
      libCall,
      action.payload.amount,
      action.payload.confTarget,
    )) as Yielded<typeof libCall>;
    type = isOut ? types.GET_LOOP_OUT_QUOTE_SUCCESS : types.GET_LOOP_IN_QUOTE_SUCCESS;
  } catch (err) {
    payload = err;
    type = isOut ? types.GET_LOOP_OUT_QUOTE_FAILURE : types.GET_LOOP_IN_QUOTE_FAILURE;
  }

  yield put({ type, payload });
}

export function* handleLoop(
  action: ReturnType<typeof actions.loopOut | typeof actions.loopIn>,
): SagaIterator {
  const isOut = action.type === types.LOOP_OUT;
  let type;
  let payload;

  try {
    yield call(requirePassword);
    const loopLib: Yielded<typeof selectLoopLibOrThrow> = yield select(
      selectLoopLibOrThrow,
    );
    const libCall = isOut ? loopLib.loopOut : loopLib.loopIn;
    payload = (yield call(libCall as any, action.payload)) as Yielded<typeof libCall>;
    type = isOut ? types.LOOP_OUT_SUCCESS : types.LOOP_IN_SUCCESS;
  } catch (err) {
    type = isOut ? types.LOOP_OUT_FAILURE : types.LOOP_IN_FAILURE;
    yield put({ type: types.LOOP_OUT_FAILURE, payload: err });
    return;
  }

  yield put({ type, payload });
}

export default function* loopSagas(): SagaIterator {
  yield takeLatest(types.SET_LOOP_URL, handleSetLoopURL);
  yield takeLatest(types.GET_LOOP_OUT_TERMS, handleGetLoopTerms);
  yield takeLatest(types.GET_LOOP_IN_TERMS, handleGetLoopTerms);
  yield takeLatest(types.GET_LOOP_OUT_QUOTE, handleGetLoopQuote);
  yield takeLatest(types.GET_LOOP_IN_QUOTE, handleGetLoopQuote);
  yield takeLatest(types.LOOP_OUT, handleLoop);
  yield takeLatest(types.LOOP_IN, handleLoop);
  yield takeLatest(types.LIST_SWAPS, handleSwaps);
}
