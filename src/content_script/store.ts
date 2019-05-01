import { Store } from 'redux';
import { AppState } from 'store/reducers';
import { configureStore } from 'store/configure';

// Get or initialize the store. Pass true to get a fresh store.
let store: Store<AppState>;
export function getStore(fresh?: boolean) {
  if (!store || fresh) {
    store = configureStore().store;
  }
  return store;
}

// Run a selector, but ensure the store has fully synced first
type Selector<T> = (s: AppState) => T;
export async function runSelector<T>(selector: Selector<T>): Promise<T> {
  const state = await waitForStoreState(s => s.sync.hasSynced);
  return selector(state);
}

// Returns a promise that only resolves once store state has hit a certain condition
type WaitStateCheckFunction = (s: AppState) => boolean;
export async function waitForStoreState(
  check: WaitStateCheckFunction,
  fresh?: boolean,
): Promise<AppState> {
  return new Promise(resolve => {
    const s = getStore(fresh);
    const initState = s.getState();
    if (check(initState)) {
      resolve(initState);
    } else {
      const unsub = s.subscribe(() => {
        const state = s.getState();
        if (check(state)) {
          unsub();
          resolve(state);
        }
      });
    }
  });
}

// Returns a promise that resolves once an action has run and the state has hit
// certain conditions.
export async function runAction(
  action: any,
  check: WaitStateCheckFunction,
  fresh?: boolean,
): Promise<AppState> {
  const s = getStore(fresh);
  await waitForStoreState(state => state.sync.hasSynced);
  s.dispatch(action);
  return waitForStoreState(check);
}
