import { fork } from 'redux-saga/effects';
import { syncSagas } from 'modules/sync';
import { cryptoSagas } from 'modules/crypto';
import { nodeSagas } from 'modules/node';
import { channelsSagas } from 'modules/channels';
import { accountSagas } from 'modules/account';

export default function* rootSaga() {
  yield fork(cryptoSagas);
  yield fork(syncSagas);
  yield fork(nodeSagas);
  yield fork(channelsSagas);
  yield fork(accountSagas);
}
