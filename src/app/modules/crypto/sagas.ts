import { SagaIterator } from 'redux-saga';
import { takeLatest, put, select, take, call } from 'redux-saga/effects';
import { encryptData, TEST_CIPHER_DATA } from 'utils/crypto';
import { getPasswordCache, setPasswordCache } from 'utils/background';
import { syncTypes } from 'modules/sync';
import { selectSalt, selectPassword } from './selectors';
import { setTestCipher, requestPassword, enterPassword } from './actions';
import types from './types';

export function* generateTestCipher(): SagaIterator {
  const password = yield select(selectPassword);
  const salt = yield select(selectSalt);
  const testCipher = encryptData(TEST_CIPHER_DATA, password, salt);
  yield put(setTestCipher(testCipher));
}

export function* cachePassword(action: ReturnType<typeof enterPassword>): SagaIterator {
  if (action.payload.save) {
    yield call(setPasswordCache, action.payload.password);
  }
}

export function* requirePassword(): SagaIterator {
  let password = yield select(selectPassword);

  // First try to pull it out of the background cache
  if (!password) {
    password = yield call(getPasswordCache);
    if (password) {
      yield put(enterPassword(password));
      yield take(syncTypes.FINISH_DECRYPT);
    }
  }

  // Otherwise prompt the user for it
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
  yield takeLatest(types.ENTER_PASSWORD, cachePassword);
}
