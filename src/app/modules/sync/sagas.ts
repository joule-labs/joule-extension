import { SagaIterator } from 'redux-saga';
import {
  takeLatest,
  takeEvery,
  call,
  put,
  select,
  take,
  fork,
  delay,
} from 'redux-saga/effects';
import { browser } from 'webextension-polyfill-ts';
import {
  selectSalt,
  selectPassword,
  selectHasSetPassword,
} from 'modules/crypto/selectors';
import cryptoTypes from 'modules/crypto/types';
import {
  storageSyncGet,
  storageSyncSet,
  SyncConfig,
  syncConfigs,
  migrateSyncedData,
} from 'utils/sync';
import { encryptData, decryptData } from 'utils/crypto';
import { startSync, finishSync } from './actions';
import types from './types';

export function* encryptAndSync(syncConfig: SyncConfig<any>) {
  // Debounce by a bit in case of rapid calls
  yield delay(300);

  let data = yield select(syncConfig.selector);

  if (syncConfig.encrypted) {
    // Get things needed for encryption, hang if we don't yet have
    const salt = yield select(selectSalt);
    let password: Yielded<typeof selectPassword> = yield select(selectPassword);
    if (!password) {
      yield take(cryptoTypes.SET_PASSWORD);
      password = (yield select(selectPassword)) as string;
    }

    // Encrypt the desired data
    data = encryptData(data, password, salt);
  }

  // Sync cypher
  yield call(storageSyncSet, syncConfig.key, data);
}

export function* watchForSync(syncConfig: SyncConfig<any>) {
  yield takeLatest(syncConfig.triggerActions as any, encryptAndSync, syncConfig);
}

export function* sync() {
  yield put(startSync());

  const keys = syncConfigs.map((c) => c.key);
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

export function* decryptSyncedData(syncConfig: SyncConfig<any>, data: any) {
  // Bail out if they haven't signed up yet
  const hasSetPassword = yield select(selectHasSetPassword);
  if (!hasSetPassword) {
    return;
  }

  // Get things needed for decryption
  const salt = yield select(selectSalt);
  let password: Yielded<typeof selectPassword> = yield select(selectPassword);

  // Wait on password if we don't have it
  if (!password) {
    yield take(cryptoTypes.ENTER_PASSWORD);
    password = (yield select(selectPassword)) as string;
  }

  // Migrate the data once it's decrypted & call the config action
  const decryptedItem = decryptData(data, password, salt);
  const payload = migrateSyncedData(syncConfig, decryptedItem);
  yield put(syncConfig.action(payload));
  yield put({ type: types.FINISH_DECRYPT });
}

export default function* cryptoSagas(): SagaIterator {
  yield takeEvery(types.CLEAR_DATA, clearData);

  // First fetch sync'd data and hydrate the store
  yield fork(sync);
  yield take(types.FINISH_SYNC);

  // Then start watching for sync opportunities
  for (const syncConfig of syncConfigs) {
    yield fork(watchForSync, syncConfig);
  }
}
