import { AppState } from 'store/reducers';

export const getAccountPubKey = (s: AppState) =>
  s.account.account ? s.account.account.pubKey : null;