import reducers, { INITIAL_STATE } from './reducers';
import * as settingsActions from './actions';
import * as settingsTypes from './types';

export { settingsActions, settingsTypes, INITIAL_STATE };
export type { SettingsState } from './reducers';
export default reducers;
