import { Channel, LightningNode } from 'lib/lnd-http';

enum ChannelsTypes {
  GET_CHANNELS = 'GET_CHANNELS',
  GET_CHANNELS_SUCCESS = 'GET_CHANNELS_SUCCESS',
  GET_CHANNELS_FAILURE = 'GET_CHANNELS_FAILURE',
}

export interface ChannelWithNode extends Channel {
  node: LightningNode;
}

export default ChannelsTypes;