import { Channel, LightningNode } from 'lib/lnd-http';

enum ChannelsTypes {
  GET_CHANNELS = 'GET_CHANNELS',
  GET_CHANNELS_SUCCESS = 'GET_CHANNELS_SUCCESS',
  GET_CHANNELS_FAILURE = 'GET_CHANNELS_FAILURE',

  OPEN_CHANNEL = 'OPEN_CHANNEL',
  OPEN_CHANNEL_SUCCESS = 'OPEN_CHANNEL_SUCCESS',
  OPEN_CHANNEL_FAILURE = 'OPEN_CHANNEL_FAILURE',
}

export interface ChannelWithNode extends Channel {
  node: LightningNode;
}

export interface OpenChannelPayload {
  address: string;
  capacity: string;
  pushAmount?: string;
  isPrivate?: boolean;
}

export default ChannelsTypes;