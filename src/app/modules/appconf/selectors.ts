import { AppState as S } from 'store/reducers';

export const selectAppconf = (s: S) => s.appconf;
export const selectAppDomains = (s: S) => Object.keys(s.appconf.configs);
