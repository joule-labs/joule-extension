import { SagaIterator } from 'redux-saga';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as actions from './actions';
import { selectNodeLibOrThrow, selectNodeInfo } from './selectors';
import LndHttpClient, { MacaroonAuthError, PermissionDeniedError } from 'lib/lnd-http';
import types from './types';

export function* handleCheckNode(action: ReturnType<typeof actions.checkNode>): SagaIterator {
  const url = action.payload;
  const client = new LndHttpClient(url);
  try {
    yield call(client.getInfo);
  } catch(err) {
    if (!(err instanceof MacaroonAuthError)) {
      yield put({ type: types.CHECK_NODE_FAILURE, payload: err });
      return;
    }
  }
  yield put({ type: types.CHECK_NODE_SUCCESS, payload: url });
}

export function* handleCheckNodes(action: ReturnType<typeof actions.checkNodes>): SagaIterator {
  const urls = action.payload;
  try {
    // Use Promise.all with custom catch here, because we expect some
    // of the requests to fail, we only need one succeed
    const requests = urls.map((url) => {
      return new Promise<string | null>(async (resolve) => {
        try {
          const client = new LndHttpClient(url);
          await client.getInfo();
          resolve(url);
        } catch(err) {
          if (err instanceof MacaroonAuthError) {
            resolve(url)
          }
          resolve(null);
        }
      });
    });
    const validUrls: Array<string | null> = yield call(Promise.all.bind(Promise), requests);
    const validUrl = validUrls.find(url => !!url);
    if (!validUrl) {
      throw new Error('None of the checked nodes were available');
    }
    yield put({ type: types.CHECK_NODE_SUCCESS, payload: validUrl });
  } catch(err) {
    yield put({ type: types.CHECK_NODE_FAILURE, payload: err });
  }
}

export function* handleCheckAuth(action: ReturnType<typeof actions.checkAuth>): SagaIterator {
  const { url, admin, readonly } = action.payload;

  // Check read-only by making sure request doesn't error
  let client = new LndHttpClient(url, readonly);
  let nodeInfo;
  try {
    nodeInfo = yield call(client.getInfo);
  } catch(err) {
    console.error('Read only macaroon failed:', err);
    yield put({
      type: types.CHECK_AUTH_FAILURE,
      payload: new Error('Read-only macaroon did not authenticate'),
    });
    return;
  }

  // Test admin by intentionally send an invalid payment,
  // but make sure we didn't error out with a macaroon auth error
  // TODO: Replace with sign message once REST supports it
  client = new LndHttpClient(url, admin);
  try {
    yield call(client.sendPayment, { payment_request: 'testing admin' });
  } catch(err) {
    console.log(err);
    if (err.constructor === MacaroonAuthError || err.constructor === PermissionDeniedError) {
      yield put({
        type: types.CHECK_AUTH_FAILURE,
        payload: new Error('Admin macaroon did not authenticate'),
      });
      return;
    }
  }

  yield put({
    type: types.CHECK_AUTH_SUCCESS,
    payload: {
      url,
      response: nodeInfo,
    },
  });
}

export function* handleGetNodeInfo(): SagaIterator {
  try {
    const nodeLib = yield select(selectNodeLibOrThrow);
    const payload = yield call(nodeLib.getInfo);
    yield put({
      type: types.GET_NODE_INFO_SUCCESS,
      payload,
    });
  } catch(err) {
    yield put({
      type: types.GET_NODE_INFO_FAILURE,
      payload: err,
    });
  }
}

// Helper function, gets node pubKey from store or fetches it
export function* getNodePubKey(): SagaIterator {
  let nodeInfo = yield select(selectNodeInfo);
  if (!nodeInfo) {
    yield call(handleGetNodeInfo);
    nodeInfo = yield select(selectNodeInfo);
  }
  return nodeInfo.identity_pubkey;
}


export default function* nodeSagas(): SagaIterator {
  yield takeLatest(types.CHECK_NODE, handleCheckNode);
  yield takeLatest(types.CHECK_NODES, handleCheckNodes);
  yield takeLatest(types.CHECK_AUTH, handleCheckAuth);
  yield takeLatest(types.GET_NODE_INFO, handleGetNodeInfo);
}
