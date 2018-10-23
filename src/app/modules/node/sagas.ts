import { SagaIterator } from 'redux-saga';
import { takeLatest, call, put } from 'redux-saga/effects';
import * as actions from './actions';
import LndHttpClient, { MacaroonAuthError } from 'lib/lnd-http';
import types from './types';

export function* handleCheckNode(action: ReturnType<typeof actions.checkNode>): SagaIterator {
  const url = action.payload;
  const client = new LndHttpClient(url);
  try {
    yield call(client.getInfo);
  } catch(err) {
    if (err.constructor !== MacaroonAuthError) {
      yield put({ type: types.CHECK_NODE_FAILURE, payload: err });
      return;
    }
  }
  yield put({ type: types.CHECK_NODE_SUCCESS, payload: url });
}

export function* handleCheckAuth(action: ReturnType<typeof actions.checkAuth>): SagaIterator {
  const { url, macaroon } = action.payload;
  const client = new LndHttpClient(url, macaroon);
  try {
    const response = yield call(client.getInfo);
    yield put({
      type: types.CHECK_AUTH_SUCCESS,
      payload: {
        url,
        response,
      },
    });
  } catch(err) {
    yield put({ type: types.CHECK_AUTH_FAILURE, payload: err });
    return;
  }
}

export default function* nodeSagas(): SagaIterator {
  yield takeLatest(types.CHECK_NODE, handleCheckNode);
  yield takeLatest(types.CHECK_AUTH, handleCheckAuth);
}
