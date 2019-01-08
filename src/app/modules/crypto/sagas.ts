import { SagaIterator } from 'redux-saga';
import { takeLatest, put, select, take, call } from 'redux-saga/effects';
import { encryptData, TEST_CIPHER_DATA } from 'utils/crypto';
import { getPasswordCache, setPasswordCache, clearPasswordCache } from 'utils/background';
import { syncTypes } from 'modules/sync';
import { selectSalt, selectPassword } from './selectors';
import { setTestCipher, requestPassword, enterPassword, generateSalt } from './actions';
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

export function* changePassword(): SagaIterator {
  try {
    yield call(requirePassword);
    
    // temporarily hold onto the previous salt in case the password is 
    // not reset and we need to restore it
    const prevSalt = yield select(selectSalt);
    // generate a new salt since we are expecting a new password
    yield put(generateSalt());

    yield put({ type: types.CHANGING_PASSWORD });
    const action = yield take([ types.CANCEL_CHANGE_PASSWORD, types.SET_PASSWORD]);
    if (action.type === types.CANCEL_CHANGE_PASSWORD) {
      // revert to the previous salt since the password was not changed
      yield put({
        type: types.GENERATE_SALT,
        payload: prevSalt,
      })
      return;
    }

    // clear the saves password cache since it's no longer valid
    yield call(clearPasswordCache);
    yield put({ type: types.CHANGE_PASSWORD_SUCCESS });
  } catch (err) {
    yield put({
      type: types.CANCEL_CHANGE_PASSWORD,
      payload: err
    });
  }
}

export default function* cryptoSagas(): SagaIterator {
  yield takeLatest(types.SET_PASSWORD, generateTestCipher);
  yield takeLatest(types.ENTER_PASSWORD, cachePassword);
  yield takeLatest(types.CHANGE_PASSWORD, changePassword);
}
