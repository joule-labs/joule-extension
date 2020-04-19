import { LOOP_TYPE } from './constants';
import { CharmPayload } from 'modules/loop/types';
import { ChannelWithNode, OpenChannelWithNode } from 'modules/channels/types';
import { Account } from 'modules/account/types';

/**
 * Method to activate/inactivate CHARM
 * @param channels
 * @param channel
 * @param isCharmEligible
 */
export function charmControl(
  channels: ChannelWithNode[] | null,
  channel: ChannelWithNode,
  isCharmEligible: boolean,
): CharmPayload {
  // do the thing to get the channel id
  let openChannels;
  const result = {
    id: '',
    point: channel.channel_point,
    isCharmEligible,
    isCharmEnabled: true,
  };
  if (channels != null) {
    openChannels = channels as OpenChannelWithNode[];
    openChannels.forEach(c => {
      if (channel.channel_point === c.channel_point) {
        result.id = c.chan_id;
      }
    });
  }
  return result;
}

export function preprocessCharmEligibility(
  account: Account | null,
  channels: ChannelWithNode[] | null,
  charm: CharmPayload | null,
): EligibilityPreProcessor {
  const balance = account != null ? account.blockchainBalance : '';
  const result = { balance, capacity: '' };
  if (channels != null) {
    channels.forEach(c => {
      if (charm != null) {
        charm.point === c.channel_point
          ? (result.capacity = c.capacity)
          : (result.capacity = '');
      }
    });
  }
  return result;
}

/**
 * Runs the logic for the CHARM algo
 * @param {string} capacity
 * @param {string} balance
 * @returns {object} loopAmount/type
 */
export function processCharm(capacity: string, balance: string): CharmAmt {
  const LOT = 0.8;
  const LIT = 0.2;
  const NO_THRESHOLD = 0;
  const U = 0.5;
  const B = parseInt(balance, 10);
  const CC = parseInt(capacity, 10);
  const CV = parseInt(balance, 10);
  const THRESHOLD = B <= CC * LIT || B >= CC * LOT;
  const AMOUNT = THRESHOLD ? CC * U - CV : NO_THRESHOLD;
  const TYPE = AMOUNT < 0 ? LOOP_TYPE.LOOP_IN : LOOP_TYPE.LOOP_OUT;
  return {
    type: TYPE,
    amt: AMOUNT > 0 ? AMOUNT : AMOUNT * -1,
  };
}

export interface CharmAmt {
  type: LOOP_TYPE;
  amt: number;
}

export interface EligibilityPreProcessor {
  balance: string;
  capacity: string;
}
