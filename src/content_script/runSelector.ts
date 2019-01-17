import { AppState, combineInitialState } from 'store/reducers';
import { storageSyncGet } from 'utils/sync';

type Selector<T> = (s: AppState) => T;

export default async function runSelector<T>(
  selector: Selector<T>,
  storageKey: string,
  stateKey: keyof AppState,
): Promise<T> {
  const storageData = await storageSyncGet([storageKey]);
  const keyData = storageData && storageData[storageKey] || {};
  const state = {
    ...combineInitialState,
    [stateKey]: {
      ...combineInitialState[stateKey],
      ...keyData,
    },
  } as AppState;
  return selector(state);
}
