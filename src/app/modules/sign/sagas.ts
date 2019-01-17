import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call,  put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { signMessage } from './actions';
import types from './types';
import { SignMessageResponse } from 'lib/lnd-http/types';

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

export default function* signSagas(): SagaIterator {
  yield takeLatest(types.SIGN_MESSAGE, handleSignMessage);
}