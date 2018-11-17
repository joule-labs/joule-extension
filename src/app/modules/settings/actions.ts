import types from './types';
import { SettingsState } from './reducers';

export function changeSettings(changes: Partial<SettingsState>) {
  return {
    type: types.CHANGE_SETTINGS,
    payload: changes,
  }
}

export function loadSettings(settings: Partial<SettingsState>) {
  return {
    type: types.LOAD_SETTINGS,
    payload: settings,
  }
}