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

export function closeChannel(fundingTxid: string, outputIndex: string) {
  return {
    type: types.CLOSE_CHANNEL,
    payload: { fundingTxid, outputIndex },
  };
}
