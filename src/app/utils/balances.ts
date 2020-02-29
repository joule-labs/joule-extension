// functions used to calculate the balances stats
import BN from 'bn.js';
import moment from 'moment';
import { ChannelWithNode } from 'modules/channels/types';
import { Utxo, CHANNEL_STATUS } from 'lnd/message';

export interface BalanceStats {
  total: string;
  spendable: string;
  spendablePercent: number;
  pendingPercent: number;
  channelPercent: number;
  onchainPercent: number;
  pendingTotal: string;
  channelTotal: string;
  onchainTotal: string;
  pendingDetails: BalanceDetailGroup[];
  channelDetails: BalanceDetailGroup[];
  onchainDetails: BalanceDetailGroup[];
}

export interface BalanceDetailGroup {
  title: string;
  balance: string;
  details: BalanceDetail[];
}

interface BalanceDetail {
  icon: {
    type: 'onchain' | 'channel';
    pubKey: string;
  };
  text: string;
  info: string;
  amount: string;
}

function getInitialStats(): BalanceStats {
  return {
    total: '0',
    spendable: '0',
    spendablePercent: 0,
    pendingPercent: 0,
    channelPercent: 0,
    onchainPercent: 0,
    pendingTotal: '0',
    channelTotal: '0',
    onchainTotal: '0',
    pendingDetails: [],
    channelDetails: [],
    onchainDetails: [],
  };
}

export function calculateBalanaceStats(
  channels: ChannelWithNode[],
  utxos: Utxo[],
): BalanceStats {
  const stats = getInitialStats();
  if (channels.length || utxos.length) {
    // only run calulations if we have some data
    updateFromChannels(stats, channels);
    updateFromChain(stats, utxos);
    updateTotals(stats);
  }
  return stats;
}

function updateFromChannels(stats: BalanceStats, channels: ChannelWithNode[]) {
  // helper to map channel -> BalanceDetail
  const channelToDetail = (pending?: boolean) => (chan: ChannelWithNode) =>
    ({
      icon: { type: 'channel', pubKey: chan.node.pub_key },
      text: chan.node.alias || chan.node.pub_key,
      info: !pending
        ? `Last seen ${moment.unix(chan.node.last_update).fromNow()}`
        : chan.status === CHANNEL_STATUS.FORCE_CLOSING
        ? `Forced Closing in ${chan.blocks_til_maturity} blocks (~${moment()
            .add(chan.blocks_til_maturity * 10, 'minutes')
            .fromNow(true)})`
        : 'Pending 1 confirmation (~10 minutes)',
      amount: chan.local_balance,
    } as BalanceDetail);

  const localChannels = channels.filter(
    chan => chan.local_balance && chan.local_balance !== '0',
  );

  // add inactive channels
  const inactive = localChannels
    .filter(chan => chan.status === CHANNEL_STATUS.OPEN && !chan.active)
    .map(channelToDetail());
  addDetailsToGroup(stats.channelDetails, 'Inactive Channel', inactive);

  // add active channels
  const active = localChannels
    .filter(chan => chan.status === CHANNEL_STATUS.OPEN && chan.active)
    .map(channelToDetail());
  addDetailsToGroup(stats.channelDetails, 'Active Channel', active);

  // add opening channels to pending stats
  const opening = localChannels
    .filter(chan => chan.status === CHANNEL_STATUS.OPENING)
    .map(channelToDetail(true));
  addDetailsToGroup(stats.pendingDetails, 'Opening Channel', opening);

  // add closing channels to pending stats
  const closing = localChannels
    .filter(
      chan =>
        chan.status === CHANNEL_STATUS.CLOSING ||
        chan.status === CHANNEL_STATUS.FORCE_CLOSING ||
        chan.status === CHANNEL_STATUS.WAITING,
    )
    .map(channelToDetail(true));
  addDetailsToGroup(stats.pendingDetails, 'Closing Channel', closing);
}

function updateFromChain(stats: BalanceStats, utxos: Utxo[]) {
  // helper to map utxo -> BalanceDetail
  const utxoToDetail = (pending?: boolean) => (utxo: Utxo) =>
    ({
      icon: { type: 'onchain' },
      text: utxo.address,
      info: pending
        ? 'Pending 1 confirmation (~10 minutes)'
        : `${utxo.confirmations} confirmations`,
      amount: utxo.amount_sat,
    } as BalanceDetail);

  // add confirmed utxos to the stats
  const confirmed = utxos
    .sort((a, b) => parseInt(a.confirmations, 10) - parseInt(b.confirmations, 10))
    .filter(u => u.confirmations && u.confirmations !== '0')
    .map(utxoToDetail());
  addDetailsToGroup(stats.onchainDetails, 'Confirmed UTXO', confirmed);

  // add unconfirmed utxos to the stats
  const unconfirmed = utxos.filter(u => !u.confirmations).map(utxoToDetail(true));
  addDetailsToGroup(stats.pendingDetails, 'Unconfirmed UTXO', unconfirmed);
}

function updateTotals(stats: BalanceStats) {
  stats.onchainTotal = sum(stats.onchainDetails, d => d.balance);
  stats.channelTotal = sum(stats.channelDetails, d => d.balance);
  stats.pendingTotal = sum(stats.pendingDetails, d => d.balance);

  stats.spendable = new BN(stats.onchainTotal).add(new BN(stats.channelTotal)).toString();
  stats.total = new BN(stats.spendable).add(new BN(stats.pendingTotal)).toString();

  stats.spendablePercent = new BN(stats.spendable)
    .muln(100)
    .divRound(new BN(stats.total))
    .toNumber();
  stats.onchainPercent = new BN(stats.onchainTotal)
    .muln(100)
    .divRound(new BN(stats.total))
    .toNumber();
  stats.channelPercent = new BN(stats.channelTotal)
    .muln(100)
    .divRound(new BN(stats.total))
    .toNumber();
  stats.pendingPercent = new BN(stats.pendingTotal)
    .muln(100)
    .divRound(new BN(stats.total))
    .toNumber();
}

// Helper functions

function addDetailsToGroup(
  group: BalanceDetailGroup[],
  title: string,
  details: BalanceDetail[],
) {
  if (details.length) {
    group.push({
      title: `${details.length} ${title}` + (details.length === 1 ? '' : 's'),
      balance: sum(details, c => c.amount),
      details,
    });
  }
}

function sum<T>(collection: T[], selector: (s: T) => string): string {
  // helper func to sum up amounts, given a collection and a
  // fat arrow func returning a numeric value for each item
  // in the collection
  return collection
    .reduce((aggr, curr) => aggr.add(new BN(selector(curr))), new BN('0'))
    .toString();
}
