import { browser } from 'webextension-polyfill-ts';
import { AppState, combineInitialState } from 'store/reducers';

type Selector<T> = (s: AppState) => T;

export default async function runSelector<T>(
  selector: Selector<T>,
  storageKey: string,
  stateKey: keyof AppState,
): Promise<T> {
  const storageData = await browser.storage.sync.get(storageKey);
  const keyData = storageData[storageKey] || {};
  const state = {
    ...combineInitialState,
    [stateKey]: {
      ...combineInitialState[stateKey],
      ...keyData,
    },
  } as AppState;
  return selector(state);
}
