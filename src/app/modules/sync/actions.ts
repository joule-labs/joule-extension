import types from './types';

export function startSync() {
  return { type: types.START_SYNC };
}

export function finishSync() {
  return { type: types.FINISH_SYNC };
}

export function finishDecrypt() {
  return { type: types.FINISH_DECRYPT };
}

export function clearData() {
  return { type: types.CLEAR_DATA };
}
