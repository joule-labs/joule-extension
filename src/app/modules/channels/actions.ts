import types, { OpenChannelPayload } from './types';

export function getChannels() {
  return { type: types.GET_CHANNELS };
}


export function openChannel(payload: OpenChannelPayload) {
  return {
    type: types.OPEN_CHANNEL,
    payload,
  };
}
