import types, { ChannelWithNode } from './types';

export interface ChannelsState {
  channels: null | ChannelWithNode[];
  isFetchingChannels: boolean;
  fetchChannelsError: null | Error;
}

export const INITIAL_STATE: ChannelsState = {
  channels: null,
  isFetchingChannels: false,
  fetchChannelsError: null,
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
      }
  }

  return state;
}
