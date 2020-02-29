import { SagaIterator } from 'redux-saga';
import { take, takeLatest, call, put, select, all } from 'redux-saga/effects';
import * as actions from './actions';
import {
  selectNodeLibOrThrow,
  selectNodeInfo,
  selectSyncedEncryptedNodeState,
  selectSyncedUnencryptedNodeState,
  selectNodeInfoError,
} from './selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { accountTypes } from 'modules/account';
import { channelsTypes } from 'modules/channels';
import LndMessageClient, { MacaroonAuthError, PermissionDeniedError } from 'lnd/message';
import types from './types';

export function* handleCheckNode(action: ReturnType<typeof actions.checkNode>) {
  const url = action.payload;
  const client = new LndMessageClient(url);
  try {
    yield call(client.getInfo);
  } catch (err) {
    if (!(err instanceof MacaroonAuthError)) {
      yield put({ type: types.CHECK_NODE_FAILURE, payload: err });
      return;
    }
  }
  yield put({ type: types.CHECK_NODE_SUCCESS, payload: url });
}

export function* handleCheckNodes(action: ReturnType<typeof actions.checkNodes>) {
  const urls = action.payload;
  try {
    // Use Promise.all with custom catch here, because we expect some
    // of the requests to fail, we only need one succeed
    const requests = urls.map(url => {
      return new Promise<string | null>(async resolve => {
        try {
          const client = new LndMessageClient(url);
          await client.getInfo();
          resolve(url);
        } catch (err) {
          if (err instanceof MacaroonAuthError) {
            resolve(url);
          }
          resolve(null);
        }
      });
    });
    const validUrls: Array<string | null> = yield call(
      Promise.all.bind(Promise),
      requests,
    );
    const validUrl = validUrls.find(url => !!url);
    if (!validUrl) {
      throw new Error('None of the checked nodes were available');
    }
    yield put({ type: types.CHECK_NODE_SUCCESS, payload: validUrl });
  } catch (err) {
    yield put({ type: types.CHECK_NODE_FAILURE, payload: err });
  }
}

export function* handleCheckAuth(action: ReturnType<typeof actions.checkAuth>) {
  const { url, admin, readonly } = action.payload;

  // Check read-only by making sure request doesn't error
  let client = new LndMessageClient(url, readonly);
  let nodeInfo;
  try {
    nodeInfo = yield call(client.getInfo);
  } catch (err) {
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
  client = new LndMessageClient(url, admin);
  try {
    yield call(client.sendPayment, { payment_request: 'testing admin' });
  } catch (err) {
    console.log(err);
    if (
      err.constructor === MacaroonAuthError ||
      err.constructor === PermissionDeniedError
    ) {
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

export function* handleUpdateNodeUrl(action: ReturnType<typeof actions.updateNodeUrl>) {
  try {
    const newUrl = action.payload;

    // passowrd is needed to decrypt the admin macaroon
    yield call(requirePassword);

    // get current macaroons from state as its needed to store the new url
    const {
      url,
      readonlyMacaroon,
    }: Yielded<typeof selectSyncedUnencryptedNodeState> = yield select(
      selectSyncedUnencryptedNodeState,
    );
    const {
      adminMacaroon,
    }: Yielded<typeof selectSyncedEncryptedNodeState> = yield select(
      selectSyncedEncryptedNodeState,
    );

    // connect to the url to test if it's working
    yield put(actions.checkNode(newUrl));
    const checkAction = yield take([types.CHECK_NODE_SUCCESS, types.CHECK_NODE_FAILURE]);

    // check for an error connecting to the node
    if (checkAction.type === types.CHECK_NODE_FAILURE) {
      // reset url in redux because checkNode will set it to null before checking
      yield put(
        actions.setNode(
          url as string,
          adminMacaroon as string,
          readonlyMacaroon as string,
        ),
      );
      throw checkAction.payload;
    }

    // save the new info in state & storage
    yield put(
      actions.setNode(newUrl, adminMacaroon as string, readonlyMacaroon as string),
    );

    yield put({
      type: types.UPDATE_NODE_URL_SUCCESS,
    });
  } catch (err) {
    yield put({
      type: types.UPDATE_NODE_URL_FAILURE,
      payload: err,
    });
  }
}

export function* handleUpdateMacaroons(
  action: ReturnType<typeof actions.updateMacaroons>,
) {
  try {
    const { url, admin, readonly } = action.payload;

    // password is needed to decrypt the admin macaroon
    yield call(requirePassword);

    // connect to the url to test if it's working
    yield put(actions.checkAuth(url, admin, readonly));
    const checkAction = yield take([types.CHECK_AUTH_SUCCESS, types.CHECK_AUTH_FAILURE]);

    // check for an error connecting to the node
    if (checkAction.type === types.CHECK_AUTH_FAILURE) {
      throw checkAction.payload;
    }

    // save the new info in state & storage
    yield put(actions.setNode(url, admin, readonly));

    // The existing data on the home screen may be for a different node
    // so we need to fetch new data to ensure it is accurate
    const updateActionsTypes = [
      // fetch the new node info
      accountTypes.GET_ACCOUNT_INFO,
      // fetch updated channels
      channelsTypes.GET_CHANNELS,
      // fetch updated transactions
      accountTypes.GET_TRANSACTIONS,
    ];
    yield all(updateActionsTypes.map(type => put({ type })));

    yield put({ type: types.UPDATE_MACAROONS_SUCCESS });
  } catch (err) {
    yield put({
      type: types.UPDATE_MACAROONS_FAILURE,
      payload: err,
    });
  }
}

export function* handleGetNodeInfo() {
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(
      selectNodeLibOrThrow,
    );
    const payload: Yielded<typeof nodeLib.getInfo> = yield call(nodeLib.getInfo);
    yield put({
      type: types.GET_NODE_INFO_SUCCESS,
      payload,
    });
  } catch (err) {
    yield put({
      type: types.GET_NODE_INFO_FAILURE,
      payload: err,
    });
  }
}

// Helper function, gets node pubKey from store or fetches it
export function* getNodePubKey() {
  let nodeInfo: Yielded<typeof selectNodeInfo> = yield select(selectNodeInfo);
  if (!nodeInfo) {
    yield call(handleGetNodeInfo);
    nodeInfo = yield select(selectNodeInfo);
  }
  if (!nodeInfo) {
    // if the fetch fails (bad cert) then throw the error
    const nodeError: Yielded<typeof selectNodeInfoError> = yield select(
      selectNodeInfoError,
    );
    throw nodeError || new Error();
  }
  return nodeInfo.identity_pubkey;
}

export default function* nodeSagas(): SagaIterator {
  yield takeLatest(types.CHECK_NODE, handleCheckNode);
  yield takeLatest(types.CHECK_NODES, handleCheckNodes);
  yield takeLatest(types.UPDATE_NODE_URL, handleUpdateNodeUrl);
  yield takeLatest(types.UPDATE_MACAROONS, handleUpdateMacaroons);
  yield takeLatest(types.CHECK_AUTH, handleCheckAuth);
  yield takeLatest(types.GET_NODE_INFO, handleGetNodeInfo);
}
