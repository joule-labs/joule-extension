import types from './types';
import { SettingsState } from './reducers';
import { normalizeDomain } from 'utils/formatters';

export function changeSettings(changes: Partial<SettingsState>) {
  return {
    type: types.CHANGE_SETTINGS,
    payload: changes,
  };
}

export function loadSettings(settings: Partial<SettingsState>) {
  return {
    type: types.LOAD_SETTINGS,
    payload: settings,
  };
}

export function clearSettings() {
  return { type: types.CLEAR_SETTINGS };
}

export function addEnabledDomain(domain: string) {
  return {
    type: types.ADD_ENABLED_DOMAIN,
    payload: normalizeDomain(domain),
  };
}

export function removeEnabledDomain(domain: string) {
  return {
    type: types.REMOVE_ENABLED_DOMAIN,
    payload: normalizeDomain(domain),
  };
}

export function addRejectedDomain(domain: string) {
  return {
    type: types.ADD_REJECTED_DOMAIN,
    payload: normalizeDomain(domain),
  };
}

export function removeRejectedDomain(domain: string) {
  return {
    type: types.REMOVE_REJECTED_DOMAIN,
    payload: normalizeDomain(domain),
  };
}
