import types from './types';
import { GetLoopOutArguments, GetLoopInArguments } from 'lib/loop-http/types';
import { selectSyncedLoopState } from './selectors';
import LoopHttpClient from 'lib/loop-http';

export function setLoop(url: string) {
  return { type: types.SET_LOOP, payload: url };
}

export function setLoopIn(url: string) {
  return { type: types.SET_LOOP_IN, payload: url };
}

export function getLoopOutQuote(amt: string, conf: string) {
  return { type: types.GET_LOOP_OUT_QUOTE, payload: amt, conf };
}

export function getLoopInQuote(amt: string /*, conf: string*/) {
  return { type: types.GET_LOOP_IN_QUOTE, payload: amt /*, conf*/ };
}

export function getLoopOut(payload: GetLoopOutArguments) {
  return { type: types.LOOP_OUT, payload };
}

export function getLoopIn(payload: GetLoopInArguments) {
  return { type: types.LOOP_IN, payload };
}

export function setSyncedLoopState(payload: ReturnType<typeof selectSyncedLoopState>) {
  const { url } = payload;
  return {
    type: types.SYNC_LOOP_STATE,
    payload: {
      url,
      loop: url ? new LoopHttpClient(url as string) : null,
    },
  };
}
