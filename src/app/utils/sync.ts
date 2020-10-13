import { browser } from 'webextension-polyfill-ts';
import { encryptData } from 'utils/crypto';
import {
  selectSyncedCryptoState,
  selectSalt,
  selectPassword,
} from 'modules/crypto/selectors';
import { setSyncedCryptoState } from 'modules/crypto/actions';
import cryptoTypes from 'modules/crypto/types';
import {
  selectSyncedEncryptedNodeState,
  selectSyncedUnencryptedNodeState,
} from 'modules/node/selectors';
import {
  setSyncedEncryptedNodeState,
  setSyncedUnencryptedNodeState,
} from 'modules/node/actions';
import nodeTypes from 'modules/node/types';
import { selectSettings } from 'modules/settings/selectors';
import { changeSettings } from 'modules/settings/actions';
import settingsTypes from 'modules/settings/types';
import { AppState } from 'store/reducers';

export interface SyncConfig<T> {
  key: string;
  version: number;
  encrypted: boolean;
  triggerActions: string[];
  migrations?: { [version: number]: (oldData: any) => any };
  selector(state: AppState): T;
  action(
    payload: T,
  ): {
    type: string;
    payload: T;
  };
}

export interface SyncData<T> {
  version: number;
  data: T;
}

export const syncConfigs: SyncConfig<any>[] = [
  {
    key: 'crypto',
    version: 1,
    encrypted: false,
    selector: selectSyncedCryptoState,
    action: setSyncedCryptoState,
    triggerActions: [cryptoTypes.SET_PASSWORD, settingsTypes.CLEAR_SETTINGS],
  },
  {
    key: 'node-unencrypted',
    version: 1,
    encrypted: false,
    selector: selectSyncedUnencryptedNodeState,
    action: setSyncedUnencryptedNodeState,
    triggerActions: [
      nodeTypes.SET_NODE,
      nodeTypes.RESET_NODE,
      settingsTypes.CLEAR_SETTINGS,
    ],
  },
  {
    key: 'node-encryped',
    version: 1,
    encrypted: true,
    selector: selectSyncedEncryptedNodeState,
    action: setSyncedEncryptedNodeState,
    triggerActions: [
      nodeTypes.SET_NODE,
      nodeTypes.RESET_NODE,
      settingsTypes.CLEAR_SETTINGS,
      cryptoTypes.CHANGE_PASSWORD_SUCCESS,
    ],
  },
  {
    key: 'settings',
    version: 1,
    encrypted: false,
    selector: selectSettings,
    action: changeSettings,
    triggerActions: [
      settingsTypes.CHANGE_SETTINGS,
      settingsTypes.CLEAR_SETTINGS,
      settingsTypes.ADD_ENABLED_DOMAIN,
      settingsTypes.REMOVE_ENABLED_DOMAIN,
      settingsTypes.ADD_REJECTED_DOMAIN,
      settingsTypes.REMOVE_REJECTED_DOMAIN,
    ],
  },
];

function getConfigByKey(key: string) {
  const config = syncConfigs.find(c => c.key === key);
  if (!config) {
    throw new Error(`Attempted to get unknown sync config '${key}'`);
  }
  return config;
}

export function storageSyncSet(key: string, item: any) {
  try {
    // Store as an object with the current version
    const config = getConfigByKey(key);
    const data = {
      version: config.version,
      data: item,
    };
    return browser.storage.sync.set({ [key]: data });
  } catch (err) {
    Promise.reject(err);
  }
}

export async function storageSyncGet(keys: string[]) {
  try {
    // Format and migrate responses
    const allResponses = await browser.storage.sync.get(keys);
    return keys.reduce((prev, key) => {
      const res = allResponses[key];
      // No data synced yet
      if (!res) {
        prev[key] = undefined;
        return prev;
      }
      // Run migrations on unencrypted data
      const config = getConfigByKey(key);
      prev[key] = migrateSyncedData(config, res);
      return prev;
    }, {} as { [key: string]: any });
  } catch (err) {
    Promise.reject(err);
  }
}

export function migrateSyncedData(config: SyncConfig<any>, item: SyncData<any>) {
  // Pre-migration sync'd data had no version number
  if (typeof item.version !== 'number') {
    item = {
      version: 1,
      data: item,
    };
  }
  // If it's still encrypted, we can't migrate the data, so just send it back
  if (config.encrypted && typeof item.data === 'string') {
    return item.data;
  }
  // Throw off some potential warnings and early returns
  if (item.version === config.version) {
    return item.data;
  }
  if (!config.migrations) {
    if (config.version !== 1) {
      console.warn(
        `Failed to find any migration functions for sync config '${config.key}'`,
      );
    }
    return item.data;
  }

  // Run migration functions
  let data = item.data;
  for (let v = item.version + 1; v <= config.version; v++) {
    data = config.migrations[v](data);
  }
  return data;
}

export function generateBackupData(state: AppState) {
  // Get things needed for encryption
  const salt = selectSalt(state);
  const password = selectPassword(state);

  return syncConfigs.reduce((a: any, sc) => {
    let data = sc.selector(state);
    if (sc.encrypted && password && salt) {
      data = encryptData(data, password, salt);
    }
    a[sc.key] = data;
    return a;
  }, {});
}
