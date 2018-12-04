import { browser } from 'webextension-polyfill-ts';
import { AppState, combineInitialState } from 'store/reducers';

type Selector<T> = (s: AppState) => T;

export default async function runSelector<T>(
  selector: Selector<T>,
  storageKey: string,
  stateKey: string,
): Promise<T> {
  const storageData = await browser.storage.sync.get(storageKey);
  const state = {
    ...combineInitialState,
    ...{ [stateKey]: storageData[storageKey] },
  } as AppState;
  return selector(state);
}
