import { browser } from 'webextension-polyfill-ts';
import { AppState, combineInitialState } from 'store/reducers';

type Selector<T> = (s: AppState) => T;

export default async function runSelector<T>(
  selector: Selector<T>,
  storageKey: string,
  stateKey: keyof AppState,
): Promise<T> {
  const storageData = await browser.storage.sync.get(storageKey);
  // storageData looks like { 'settings': { version: 1, data: {...} } }
  const keyData = storageData[storageKey] || {};
  // keyData looks like { version: 1, data: {...} }
  // we need to pluck out the inner data value
  const dataWithoutVersion = keyData.data || {};
  const state = {
    ...combineInitialState,
    [stateKey]: {
      ...combineInitialState[stateKey],
      ...dataWithoutVersion,
    },
  } as AppState;
  return selector(state);
}
