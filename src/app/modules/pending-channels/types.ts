import {LightningNode, PendingForceClosingChannel } from 'lib/lnd-http';

enum PendingChannelsTypes {
  GET_PENDING_CHANNELS = 'GET_PENDING_CHANNELS',
  GET_PENDING_CHANNELS_SUCCESS = 'GET_PENDING_CHANNELS_SUCCESS',
  GET_PENDING_CHANNELS_FAILURE = 'GET_PENDING_CHANNELS_FAILURE',
}

export interface PendingChannelWithNode extends PendingForceClosingChannel {
  node: LightningNode;
}

export default PendingChannelsTypes;