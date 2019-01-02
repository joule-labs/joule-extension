import { Channel, LightningNode, PendingForceClosingChannel, WaitingCloseChannel, PendingOpenChannel } from 'lib/lnd-http';

enum ChannelsTypes {
  GET_CHANNELS = 'GET_CHANNELS',
  GET_CHANNELS_SUCCESS = 'GET_CHANNELS_SUCCESS',
  GET_CHANNELS_FAILURE = 'GET_CHANNELS_FAILURE',
}

export interface ChannelWithNode extends Channel {
  node: LightningNode;
}
export interface ForceClosingChannelWithNode extends PendingForceClosingChannel {
  node: LightningNode;
}

export interface WaitClosingChannelWithNode extends WaitingCloseChannel {
  node: LightningNode;
}

export interface PendingOpenChannelWithNode extends PendingOpenChannel {
  node: LightningNode;
}
export default ChannelsTypes;