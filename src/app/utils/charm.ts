import { LOOP_TYPE } from './constants';

/**
 * Runs the logic for the CHARM algo
 * @param {string} capacity
 * @param {string} balance
 * @returns {object} loopAmount/type
 */
export function processCharm(capacity: string, balance: string): object {
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
