import { SagaIterator } from 'redux-saga';
import { takeLatest, put, select, take } from 'redux-saga/effects';
import { encryptData, TEST_CIPHER_DATA } from 'utils/crypto';
import { syncTypes } from 'modules/sync';
import { selectSalt, selectPassword } from './selectors';
import { setTestCipher, requestPassword } from './actions';
import types from './types';

export function* generateTestCipher(): SagaIterator {
  const password = yield select(selectPassword);
  const salt = yield select(selectSalt);
  const testCipher = encryptData(TEST_CIPHER_DATA, password, salt);
  yield put(setTestCipher(testCipher));
}

export function* requirePassword(): SagaIterator {
  const password = yield select(selectPassword);
  if (!password) {
    yield put(requestPassword());
    const action = yield take([types.CANCEL_PASSWORD, syncTypes.FINISH_DECRYPT]);
    if (action.type === types.CANCEL_PASSWORD) {
      throw new Error('Password required');
    }
  }
}

export default function* cryptoSagas(): SagaIterator {
  yield takeLatest(types.SET_PASSWORD, generateTestCipher);
}
