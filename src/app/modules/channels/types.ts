import {
  OpenChannel,
  OpeningChannel,
  ClosingChannel,
  ForceClosingChannel,
  WaitingChannel,
  LightningNode,
} from 'lnd/message';

enum ChannelsTypes {
  GET_CHANNELS = 'GET_CHANNELS',
  GET_CHANNELS_SUCCESS = 'GET_CHANNELS_SUCCESS',
  GET_CHANNELS_FAILURE = 'GET_CHANNELS_FAILURE',

  OPEN_CHANNEL = 'OPEN_CHANNEL',
  OPEN_CHANNEL_SUCCESS = 'OPEN_CHANNEL_SUCCESS',
  OPEN_CHANNEL_FAILURE = 'OPEN_CHANNEL_FAILURE',

  CLOSE_CHANNEL = 'CLOSE_CHANNEL',
  CLOSE_CHANNEL_SUCCESS = 'CLOSE_CHANNEL_SUCCESS',
  CLOSE_CHANNEL_FAILURE = 'CLOSE_CHANNEL_FAILURE',
}

// Is there a better way to do this?
export interface OpenChannelWithNode extends OpenChannel {
  node: LightningNode;
}
export interface OpeningChannelWithNode extends OpeningChannel {
  node: LightningNode;
}
export interface ClosingChannelWithNode extends ClosingChannel {
  node: LightningNode;
}
export interface ForceClosingChannelWithNode extends ForceClosingChannel {
  node: LightningNode;
}
export interface WaitingChannelWithNode extends WaitingChannel {
  node: LightningNode;
}
export type ChannelWithNode =
  | OpenChannelWithNode
  | OpeningChannelWithNode
  | ClosingChannelWithNode
  | ForceClosingChannelWithNode
  | WaitingChannelWithNode;

export interface OpenChannelPayload {
  address: string;
  capacity: string;
  pushAmount?: string;
  isPrivate?: boolean;
  fee?: string;
}

export default ChannelsTypes;
