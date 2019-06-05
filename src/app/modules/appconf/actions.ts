import types, { AppConfig } from './types';
import { AppconfState } from './reducers';
import { normalizeDomain } from 'utils/formatters';

export function setAppConfig(domain: string, config: AppConfig) {
  return {
    type: types.SET_APP_CONFIG,
    payload: {
      domain: normalizeDomain(domain),
      config,
    },
  };
}

export function deleteAppConfig(domain: string) {
  return {
    type: types.DELETE_APP_CONFIG,
    payload: normalizeDomain(domain),
  };
}

export function setAppconf(state: Partial<AppconfState>) {
  return {
    type: types.SET_APPCONF,
    payload: state,
  };
}
