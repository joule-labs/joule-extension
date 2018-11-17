import { Denomination, Fiat } from 'utils/constants';
import types from './types';

export interface SettingsState {
  fiat: Fiat;
  denomination: Denomination;
  isNoFiat: boolean;
  isFiatPrimary: boolean;
}

export const INITIAL_STATE: SettingsState = {
  fiat: Fiat.USD,
  denomination: Denomination.SATOSHIS,
  isNoFiat: false,
  isFiatPrimary: false,
};

export default function settingsReducer(
  state: SettingsState = INITIAL_STATE,
  action: any,
): SettingsState {
  switch (action.type) {
    case types.CHANGE_SETTINGS:
    case types.LOAD_SETTINGS:
      return {
        ...state,
        ...action.payload,
      };
  }

  return state;
}
