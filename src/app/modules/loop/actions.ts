import types from './types';
import { GetLoopOutArguments } from 'lib/loop-http/types';

export function setLoop(url: string) {
  return { type: types.SET_LOOP, payload: url };
}

export function getLoopOutTerms() {
  return { type: types.GET_LOOP_OUT_TERMS };
}

export function getLoopOutQuote(amt: string) {
  return { type: types.GET_LOOP_OUT_QUOTE, payload: amt };
}

export function getLoopOut(payload: GetLoopOutArguments) {
  return { type: types.GET_LOOP_OUT, payload };
}
