// tslint:disable no-empty-interface
import { combineReducers } from 'redux';
import crypto, { CryptoState, INITIAL_STATE as cryptoInitialState } from 'modules/crypto';
import sync, { SyncState, INITIAL_STATE as syncInitialState } from 'modules/sync';
import node, { NodeState, INITIAL_STATE as nodeInitialState } from 'modules/node';
import channels, { ChannelsState, INITIAL_STATE as channelsInitialState } from 'modules/channels';
import pendingChannels, { PendingChannelsState, INITIAL_STATE as pendingChannelsInitialState } from 'modules/pending-channels';
import account, { AccountState, INITIAL_STATE as accountInitialState } from 'modules/account';
import payment, { PaymentState, INITIAL_STATE as paymentInitialState } from 'modules/payment/reducers';
import settings, { SettingsState, INITIAL_STATE as settingsInitialState } from 'modules/settings';
import rates, { RatesState, INITIAL_STATE as ratesInitialState } from 'modules/rates';

export interface AppState {
  crypto: CryptoState;
  sync: SyncState;
  node: NodeState;
  channels: ChannelsState;
  pendingChannels: PendingChannelsState;
  account: AccountState;
  payment: PaymentState;
  settings: SettingsState;
  rates: RatesState;
}

export const combineInitialState: Partial<AppState> = {
  crypto: cryptoInitialState,
  sync: syncInitialState,
  node: nodeInitialState,
  channels: channelsInitialState,
  pendingChannels: pendingChannelsInitialState,
  account: accountInitialState,
  payment: paymentInitialState,
  settings: settingsInitialState,
  rates: ratesInitialState,
};

export default combineReducers<AppState>({
  crypto,
  sync,
  node,
  channels,
  pendingChannels,
  account,
  payment,
  settings,
  rates,
});
