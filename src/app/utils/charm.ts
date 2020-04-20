import { LOOP_TYPE, CHARM_VALUES, SWAP_STATUS } from './constants';
import { CharmPayload } from 'modules/loop/types';
import { ChannelWithNode, OpenChannelWithNode } from 'modules/channels/types';
import { Account } from 'modules/account/types';
import { GetSwapsResponse } from 'lib/loop-http';

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
  const result = { balance, capacity: '', localBalance: '' };
  if (channels != null) {
    // tslint:disable-next-line: prefer-for-of
    channels.forEach(c => {
      if (charm != null) {
        if (charm.point === c.channel_point) {
          result.capacity = c.capacity;
          result.localBalance = c.local_balance;
        }
      }
    });
  }
  return result;
}

/**
 * Runs the logic for the CHARM algorithm
 * @param {string} capacity
 * @param {string} balance
 * @returns {object} loopAmount/type
 */
export function processCharm(
  capacity: string,
  balance: string,
  localBalance: string,
): CharmAmt {
  const LOT = CHARM_VALUES.LOT;
  const LIT = CHARM_VALUES.LIT;
  const NO_THRESHOLD = CHARM_VALUES.NO_THRESHOLD;
  const U = CHARM_VALUES.U;
  const B = parseInt(balance, 10);
  const CC = parseInt(capacity, 10);
  const CV = parseInt(localBalance, 10);
  const THRESHOLD = B <= CC * LIT || B >= CC * LOT;
  const AMOUNT = THRESHOLD ? CC * U - CV : NO_THRESHOLD;
  const TYPE = AMOUNT > 0 ? LOOP_TYPE.LOOP_IN : LOOP_TYPE.LOOP_OUT;
  return {
    type: TYPE,
    amt: AMOUNT > 0 ? AMOUNT : AMOUNT * -1,
  };
}

/**
 * Helper method for seeing if swaps are already in progress
 * @param swapInfo
 */
export function isSwapInitiated(swapInfo: GetSwapsResponse | null): SwapCheck {
  const result = { isInitiated: false };
  if (swapInfo != null) {
    swapInfo.swaps.forEach(s => {
      if (s.state === SWAP_STATUS.INITIATED) {
        result.isInitiated = true;
      }
    });
  }
  return result;
}

export interface CharmAmt {
  type: LOOP_TYPE;
  amt: number;
}

export interface EligibilityPreProcessor {
  balance: string;
  capacity: string;
  localBalance: string;
}

export interface SwapCheck {
  isInitiated: boolean;
}
