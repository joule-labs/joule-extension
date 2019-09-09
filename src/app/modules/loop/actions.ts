import types from './types';
import { LoopOutArguments, LoopInArguments } from 'lib/loop-http/types';
import { selectSyncedLoopState } from './selectors';
import LoopHttpClient from 'lib/loop-http';

export function setLoop(url: string) {
  return { type: types.SET_LOOP_URL, payload: url };
}

export function getLoopOutTerms() {
  return { type: types.GET_LOOP_OUT_TERMS };
}

export function getLoopInTerms() {
  return { type: types.GET_LOOP_IN_TERMS };
}

export function getLoopOutQuote(amount: string | number, confTarget?: string | number) {
  return { type: types.GET_LOOP_OUT_QUOTE, payload: { amount, confTarget } };
}

export function getLoopInQuote(amount: string | number, confTarget?: string | number) {
  return { type: types.GET_LOOP_IN_QUOTE, payload: { amount, confTarget } };
}

export function loopOut(payload: LoopOutArguments) {
  return { type: types.LOOP_OUT, payload };
}

export function loopIn(payload: LoopInArguments) {
  return { type: types.LOOP_IN, payload };
}

export function resetLoop() {
  return { type: types.RESET_LOOP };
}

export function setSyncedLoopState(payload: ReturnType<typeof selectSyncedLoopState>) {
  const { url } = payload;
  return {
    type: types.SYNC_LOOP_STATE,
    payload: {
      url,
      lib: url ? new LoopHttpClient(url as string) : null,
    },
  };
}
