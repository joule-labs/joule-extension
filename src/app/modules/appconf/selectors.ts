import { AppState as S } from 'store/reducers';
import { normalizeDomain } from 'utils/formatters';
import { AppConfig } from './types';

export const selectAppconf = (s: S) => s.appconf;
export const selectAppDomains = (s: S) => Object.keys(s.appconf.configs);

export const selectConfigByDomain = (s: S, domain: string): AppConfig | undefined => {
  return s.appconf.configs[normalizeDomain(domain)];
};
