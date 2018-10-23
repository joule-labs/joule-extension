import { SagaIterator } from 'redux-saga';
import { takeLatest, put, select } from 'redux-saga/effects';
import { encryptData, TEST_CIPHER_DATA } from 'utils/crypto';
import { selectSalt, selectPassword } from './selectors';
import { setTestCipher } from './actions';
import types from './types';

export function* generateTestCipher(): SagaIterator {
  const password = yield select(selectPassword);
  const salt = yield select(selectSalt);
  const testCipher = encryptData(TEST_CIPHER_DATA, password, salt);
  yield put(setTestCipher(testCipher));
}

export default function* cryptoSagas(): SagaIterator {
  yield takeLatest(types.SET_PASSWORD, generateTestCipher);
}
