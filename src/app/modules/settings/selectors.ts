import { AppState as S } from 'store/reducers';

export const selectSettings = (s: S) => s.settings;
