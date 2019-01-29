import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call,  put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { signMessage, verifyMessage } from './actions';
import types from './types';
import { SignMessageResponse, VerifyMessageResponse } from 'lib/lnd-http/types';
import { safeGetNodeInfo } from 'utils/misc';

export function* handleSignMessage(action: ReturnType<typeof signMessage>): SagaIterator {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const payload: Yielded<SignMessageResponse> = yield call(nodeLib.signMessage, action.payload);
    
    yield put({ 
      type: types.SIGN_MESSAGE_SUCCESS,
      payload,
    });
  } catch(err) {
    yield put({
      type: types.SIGN_MESSAGE_FAILURE,
      payload: err,
    });
  }
}

export function* handleVerifyMessage(action: ReturnType<typeof verifyMessage>): SagaIterator {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const verification: Yielded<VerifyMessageResponse> = yield call(nodeLib.verifyMessage, action.payload);
    const nodeInfo: Yielded<typeof nodeLib.getNodeInfo> = yield call(safeGetNodeInfo, nodeLib, verification.pubkey);
    const payload = {
      ...verification,
      alias: nodeInfo.node.alias
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
  } catch(err) {
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