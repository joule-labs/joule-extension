import { Denomination, Fiat } from 'utils/constants';
import types from './types';

export interface SettingsState {
  fiat: Fiat;
  denomination: Denomination;
  isNoFiat: boolean;
  isFiatPrimary: boolean;
  enabledDomains: string[];
  rejectedDomains: string[];
}

export const INITIAL_STATE: SettingsState = {
  fiat: Fiat.USD,
  denomination: Denomination.SATOSHIS,
  isNoFiat: false,
  isFiatPrimary: false,
  enabledDomains: [],
  rejectedDomains: [],
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

    case types.ADD_ENABLED_DOMAIN:
      return {
        ...state,
        enabledDomains: [...state.enabledDomains, action.payload].filter(
          (domain, idx, arr) => arr.indexOf(domain) === idx,
        ),
      };

    case types.REMOVE_ENABLED_DOMAIN:
      return {
        ...state,
        enabledDomains: state.enabledDomains.filter((d) => d !== action.payload),
      };

    case types.ADD_REJECTED_DOMAIN:
      return {
        ...state,
        rejectedDomains: [...state.rejectedDomains, action.payload].filter(
          (domain, idx, arr) => arr.indexOf(domain) === idx,
        ),
      };

    case types.REMOVE_REJECTED_DOMAIN:
      return {
        ...state,
        rejectedDomains: state.rejectedDomains.filter((d) => d !== action.payload),
      };
  }

  return state;
}
