import { takeLatest, select, call, put } from 'typed-redux-saga';
import { SignMessageResponse as WebLNSignMessageResponse } from 'webln';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { signMessage, verifyMessage } from './actions';
import types from './types';
import { safeGetNodeInfo } from 'utils/misc';

export function* handleSignMessage(action: ReturnType<typeof signMessage>) {
  try {
    yield call(requirePassword);
    const nodeLib = yield* select(selectNodeLibOrThrow);
    const res = yield* call(nodeLib.signMessage, action.payload);

    if (!res.signature) {
      throw new Error('Message failed to sign, missing signature');
    }

    const payload: WebLNSignMessageResponse = {
      message: action.payload,
      signature: res.signature,
    };

    yield put({
      type: types.SIGN_MESSAGE_SUCCESS,
      payload,
    });
  } catch (err) {
    yield put({
      type: types.SIGN_MESSAGE_FAILURE,
      payload: err,
    });
  }
}

export function* handleVerifyMessage(action: ReturnType<typeof verifyMessage>) {
  try {
    yield call(requirePassword);
    const nodeLib = yield* select(selectNodeLibOrThrow);
    const verification = yield* call(nodeLib.verifyMessage, action.payload);
    const nodeInfo = yield* call(safeGetNodeInfo, nodeLib, verification.pubkey);
    const payload = {
      ...verification,
      alias: nodeInfo.node.alias,
    };
    if (verification.valid) {
      yield put({
        type: types.VERIFY_MESSAGE_VALID,
        payload,
      });
    } else {
      yield put({
        type: types.VERIFY_MESSAGE_INVALID,
        payload,
      });
    }
  } catch (err) {
    yield put({
      type: types.VERIFY_MESSAGE_FAILURE,
      payload: err,
    });
  }
}

export default function* signSagas() {
  yield takeLatest(types.SIGN_MESSAGE, handleSignMessage);
  yield takeLatest(types.VERIFY_MESSAGE, handleVerifyMessage);
}
