import { AES, enc } from 'crypto-js';
import {
  selectSyncedCryptoState,
  selectSalt,
  selectPassword,
} from 'modules/crypto/selectors';
import { setSyncedCryptoState } from 'modules/crypto/actions';
import cryptoTypes from 'modules/crypto/types';
import { selectSyncedEncryptedNodeState, selectSyncedUnencryptedNodeState } from 'modules/node/selectors';
import { setSyncedEncryptedNodeState, setSyncedUnencryptedNodeState } from 'modules/node/actions';
import nodeTypes from 'modules/node/types';
import { selectSettings } from 'modules/settings/selectors';
import { changeSettings } from 'modules/settings/actions';
import settingsTypes from 'modules/settings/types';
import { AppState } from 'store/reducers';
import { Dispatch } from 'redux';

export const TEST_CIPHER_DATA = 'Howdy partner!';

export function encryptData(data: any, password: string, salt: string) {
  return AES.encrypt(JSON.stringify(data), password + salt).toString();
}

export function decryptData(cipher: any, password: string, salt: string) {
  const decrypted = AES.decrypt(cipher, password + salt);
  return JSON.parse(decrypted.toString(enc.Utf8));
}

export interface SyncConfig<T> {
  key: string;
  encrypted: boolean;
  triggerActions: string[];
  selector(state: AppState): T;
  action(
    payload: T,
  ): {
    type: string;
    payload: T;
  };
}
export const syncConfigs: Array<SyncConfig<any>> = [
  {
    key: 'crypto',
    encrypted: false,
    selector: selectSyncedCryptoState,
    action: setSyncedCryptoState,
    // TODO: Add triggers for when they reset account, import account
    triggerActions: [cryptoTypes.SET_PASSWORD],
  },
  {
    key: 'node-unencrypted',
    encrypted: false,
    selector: selectSyncedUnencryptedNodeState,
    action: setSyncedUnencryptedNodeState,
    triggerActions: [nodeTypes.SET_NODE],
  },
  {
    key: 'node-encryped',
    encrypted: true,
    selector: selectSyncedEncryptedNodeState,
    action: setSyncedEncryptedNodeState,
    triggerActions: [nodeTypes.SET_NODE],
  },
  {
    key: 'settings',
    encrypted: false,
    selector: selectSettings,
    action: changeSettings,
    triggerActions: [settingsTypes.CHANGE_SETTINGS],
  }
];

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

export function injectBackupData(
  data: string,
  dispatch: Dispatch,
  password: string,
  salt: string,
) {
  const obj = JSON.parse(data);
  syncConfigs.forEach(sc => {
    if (obj[sc.key]) {
      let value = obj[sc.key];
      if (sc.encrypted) {
        value = decryptData(value, password, salt);
      }
      dispatch(sc.action(value));
    }
  });
  setTimeout(() => {
    dispatch({ type: 'BACKUP_RESTORED' });
  }, 50);
}
