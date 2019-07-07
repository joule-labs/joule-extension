import { AppState } from 'store/reducers';

export const selectLoopLib = (s: AppState) => s.loop.lib;
export const selectLoopLibOrThrow = (s: AppState) => {
  const loopLib = selectLoopLib(s);
  if (!loopLib) {
    throw new Error('Loop must be configured first');
  }
  return loopLib;
};
