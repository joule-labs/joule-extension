import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, put } from 'redux-saga/effects';
import { SignMessageResponse as WebLNSignMessageResponse } from 'webln';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { signMessage, verifyMessage } from './actions';
import types from './types';
import {
  SignMessageResponse as LndSignMessageResponse,
  VerifyMessageResponse as LndVerifyMessageResponse,
} from 'lnd/types';
import { safeGetNodeInfo } from 'utils/misc';

export function* handleSignMessage(action: ReturnType<typeof signMessage>) {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(
      selectNodeLibOrThrow,
    );
    const res: Yielded<LndSignMessageResponse> = yield call(
      nodeLib.signMessage,
      action.payload,
    );

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
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(
      selectNodeLibOrThrow,
    );
    const verification: Yielded<LndVerifyMessageResponse> = yield call(
      nodeLib.verifyMessage,
      action.payload,
    );
    const nodeInfo: Yielded<typeof nodeLib.getNodeInfo> = yield call(
      safeGetNodeInfo,
      nodeLib,
      verification.pubkey,
    );
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

export default function* signSagas(): SagaIterator {
  yield takeLatest(types.SIGN_MESSAGE, handleSignMessage);
  yield takeLatest(types.VERIFY_MESSAGE, handleVerifyMessage);
}
