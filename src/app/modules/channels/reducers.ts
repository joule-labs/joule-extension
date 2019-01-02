import types, { ChannelWithNode, WaitClosingChannelWithNode, PendingOpenChannelWithNode, ForceClosingChannelWithNode } from './types';

export interface ChannelsState {
  channels: null | ChannelWithNode[];
  forceClosingChannels: null | ForceClosingChannelWithNode[];
  waitClosingChannels: null | WaitClosingChannelWithNode[];
  pendingOpenChannels: null | PendingOpenChannelWithNode[];
  isFetchingChannels: boolean;
  fetchChannelsError: null | Error;
}

export const INITIAL_STATE: ChannelsState = {
  channels: null,
  forceClosingChannels: null,
  waitClosingChannels: null,
  pendingOpenChannels: null,
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
        forceClosingChannels: [],
        waitClosingChannels: [],
        pendingOpenChannels:[],
        isFetchingChannels: true,
        fetchChannelsError: null,
      };
    case types.GET_CHANNELS_SUCCESS:
      return {
        ...state,
        channels: action.payload,
        forceClosingChannels: action.payloadFC,
        waitClosingChannels: action.payloadWC,
        pendingOpenChannels: action.payloadPO,
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
