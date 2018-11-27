import { SagaIterator, delay } from 'redux-saga';
import { takeLatest, takeEvery, call, put, select, take, fork } from 'redux-saga/effects';
import { browser } from 'webextension-polyfill-ts';
import {
  selectSalt,
  selectPassword,
  selectHasSetPassword,
} from 'modules/crypto/selectors';
import cryptoTypes from 'modules/crypto/types';
import { storageSyncGet, storageSyncSet } from 'utils/sync';
import { encryptData, decryptData, SyncConfig, syncConfigs } from 'utils/crypto';
import { startSync, finishSync } from './actions';
import types from './types';

export function* encryptAndSync(syncConfig: SyncConfig<any>): SagaIterator {
  // Debounce by a bit in case of rapid calls
  yield call(delay, 300);

  let data = yield select(syncConfig.selector);

  if (syncConfig.encrypted) {
    // Get things needed for encryption, hang if we don't yet have
    const salt = yield select(selectSalt);
    let password = yield select(selectPassword);
    if (!password) {
      yield take(cryptoTypes.SET_PASSWORD);
      password = yield select(selectPassword);
    }

    // Encrypt the desired data
    data = encryptData(data, password, salt);
  }

  // Sync cypher
  yield call(storageSyncSet, syncConfig.key, data);
}

export function* watchForSync(syncConfig: SyncConfig<any>): SagaIterator {
  yield takeLatest(syncConfig.triggerActions as any, encryptAndSync, syncConfig);
}

export function* sync(): SagaIterator {
  yield put(startSync());

  const keys = syncConfigs.map(c => c.key);
  const items = yield call(storageSyncGet, keys);

  for (const config of syncConfigs) {
    if (items[config.key] !== undefined) {
      if (config.encrypted) {
        yield fork(decryptSyncedData, config, items[config.key]);
      } else {
        yield put(config.action(items[config.key]));
      }
    }
  }

  yield put(finishSync());
  return;
}

export function* clearData(): SagaIterator {
  yield call(browser.storage.sync.clear);
  window.close();
}

export function* decryptSyncedData(syncConfig: SyncConfig<any>, data: any): SagaIterator {
  // Bail out if they haven't signed up yet
  const hasSetPassword = yield select(selectHasSetPassword);
  if (!hasSetPassword) {
    return;
  }

  // Get things needed for encryption
  const salt = yield select(selectSalt);
  let password = yield select(selectPassword);

  // Wait on password if we don't have it
  if (!password) {
    yield take(cryptoTypes.ENTER_PASSWORD);
    password = yield select(selectPassword);
  }

  // Call their respective actions
  const payload = decryptData(data, password, salt);
  yield put(syncConfig.action(payload));
  yield put({ type: types.FINISH_DECRYPT})
}

export default function* cryptoSagas(): SagaIterator {
  yield takeEvery(types.CLEAR_DATA, clearData);
  
  // First fetch sync'd data and hydrate the store
  yield fork(sync);
  yield take(types.FINISH_SYNC);
  console.log('Continuing');

  // Then start watching for sync opportunities
  for (const syncConfig of syncConfigs) {
    yield fork(watchForSync, syncConfig);
  }
}
