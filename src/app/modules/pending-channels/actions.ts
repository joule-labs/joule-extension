import types from './types';

export function getPendingChannels() {
  return { type: types.GET_PENDING_CHANNELS };
}
