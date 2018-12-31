import types, { PendingChannelWithNode } from './types';
import { PendingOpenChannel } from 'lib/lnd-http';

export interface PendingChannelsState {
  forceClosingChannels: null | PendingChannelWithNode[];
  waitClosingChannels: null | PendingChannelWithNode[];
  pendingOpenChannels: null | PendingChannelWithNode[];
  isFetchingChannels: boolean;
  fetchChannelsError: null | Error;
}

export const INITIAL_STATE: PendingChannelsState = {
  forceClosingChannels: null,
  waitClosingChannels: null,
  pendingOpenChannels: null,
  isFetchingChannels: false,
  fetchChannelsError: null,
};

export default function pendingChannelsReducers(
  state: PendingChannelsState = INITIAL_STATE,
  action: any,
): PendingChannelsState {
  switch (action.type) {
    case types.GET_PENDING_CHANNELS:
      return {
        ...state,
        forceClosingChannels: [],
        waitClosingChannels: [],
        pendingOpenChannels:[],
        isFetchingChannels: true,
        fetchChannelsError: null,
      };
    case types.GET_PENDING_CHANNELS_SUCCESS:
      return {
        ...state,
        forceClosingChannels: action.payloadFC,
        waitClosingChannels: action.payloadWC,
        pendingOpenChannels: action.payloadPO,
        isFetchingChannels: false,
      };
    case types.GET_PENDING_CHANNELS_FAILURE:
      return {
        ...state,
        fetchChannelsError: action.payload,
        isFetchingChannels: false,
      }
  }

  return state;
}
