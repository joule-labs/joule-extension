import types from './types';
import { GetLoopOutArguments, GetLoopInArguments } from 'lib/loop-http/types';

export function setLoop(url: string) {
  return { type: types.SET_LOOP, payload: url };
}

export function setLoopIn(url: string) {
  return { type: types.SET_LOOP_IN, payload: url };
}

export function getLoopOutTerms() {
  return { type: types.GET_LOOP_OUT_TERMS };
}

export function getLoopInTerms() {
  return { type: types.GET_LOOP_IN_TERMS };
}

export function getLoopOutQuote(amt: string, conf: string) {
  return { type: types.GET_LOOP_OUT_QUOTE, payload: amt, conf };
}

export function getLoopInQuote(amt: string /*, conf: string*/) {
  return { type: types.GET_LOOP_IN_QUOTE, payload: amt /*, conf*/ };
}

export function getLoopOut(payload: GetLoopOutArguments) {
  return { type: types.GET_LOOP_OUT, payload };
}

export function getLoopIn(payload: GetLoopInArguments) {
  return { type: types.GET_LOOP_IN, payload };
}
