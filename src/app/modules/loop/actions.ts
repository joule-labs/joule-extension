import types from './types';

export function setLoop(url: string) {
  return { type: types.SET_LOOP, payload: url };
}

export function getLoopOutTerms() {
  return { type: types.GET_LOOP_OUT_TERMS };
}

export function getLoopOutQuote(amt: string) {
  return { type: types.GET_LOOP_OUT_QUOTE, payload: amt };
}

export function getLoopOut() {
  return { type: types.GET_LOOP_OUT };
}
