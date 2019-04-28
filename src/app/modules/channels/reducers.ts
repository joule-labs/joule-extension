import types, { ChannelWithNode } from './types';

export interface ChannelsState {
  channels: null | ChannelWithNode[];
  isFetchingChannels: boolean;
  fetchChannelsError: null | Error;

  newChannelTxIds: { [address: string]: string };
  isOpeningChannel: boolean;
  openChannelError: null | Error;

  closingTxId: null | string;
  isClosingChannel: boolean;
  closeChannelError: null | Error;
}

export const INITIAL_STATE: ChannelsState = {
  channels: null,
  isFetchingChannels: false,
  fetchChannelsError: null,

  newChannelTxIds: {},
  isOpeningChannel: false,
  openChannelError: null,

  closingTxId: null,
  isClosingChannel: false,
  closeChannelError: null,
};

export default function channelsReducers(
  state: ChannelsState = INITIAL_STATE,
  action: any,
): ChannelsState {
  switch (action.type) {
    case types.GET_CHANNELS:
      return {
        ...state,
        channels: [],
        isFetchingChannels: true,
        fetchChannelsError: null,
      };
    case types.GET_CHANNELS_SUCCESS:
      return {
        ...state,
        channels: action.payload,
        isFetchingChannels: false,
      };
    case types.GET_CHANNELS_FAILURE:
      return {
        ...state,
        fetchChannelsError: action.payload,
        isFetchingChannels: false,
      };

    case types.OPEN_CHANNEL:
      return {
        ...state,
        isOpeningChannel: true,
        openChannelError: null,
      };
    case types.OPEN_CHANNEL_SUCCESS:
      return {
        ...state,
        newChannelTxIds: {
          ...state.newChannelTxIds,
          [action.payload.address]: action.payload.txid,
        },
        isOpeningChannel: false,
      };
    case types.OPEN_CHANNEL_FAILURE:
      return {
        ...state,
        openChannelError: action.payload,
        isOpeningChannel: false,
      };

    case types.CLOSE_CHANNEL:
      return {
        ...state,
        isClosingChannel: true,
        closeChannelError: null,
      };
    case types.CLOSE_CHANNEL_SUCCESS:
      return {
        ...state,
        closingTxId: action.payload,
        isClosingChannel: false,
      };
    case types.CLOSE_CHANNEL_FAILURE:
      return {
        ...state,
        closeChannelError: action.payload,
        isClosingChannel: false,
      };
  }

  return state;
}
