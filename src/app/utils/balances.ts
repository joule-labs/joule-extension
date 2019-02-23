// functions used to calculate the balances stats
import BN from 'bn.js';
import { ChannelWithNode } from 'modules/channels/types';
import { Utxo, CHANNEL_STATUS } from 'lib/lnd-http';

export interface BalanceStats {
  total: string,
  spendable: string,
  pendingPercent: number,
  channelPercent: number,
  onchainPercent: number,
  pendingTotal: string,
  channelTotal: string,
  onchainTotal: string,
  pendingDetails: BalanceDetailGroup[],
  channelDetails: BalanceDetailGroup[],
  onchainDetails: BalanceDetailGroup[],
}

interface BalanceDetailGroup {
  title: string,
  balance: string,
  details: BalanceDetail[],
}

interface BalanceDetail {
  icon: {
    type: 'onchain' | 'channel',
    pubKey: string,
  },
  text: string,
  info: string,
  amount: string,
}

function getInitialStats(): BalanceStats {
  return {
    total: '0',
    spendable: '0',
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
};

export function calculateBalanaceStats(
  channels: ChannelWithNode[], 
  utxos: Utxo[]
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
  const channelToDetail = (chan: ChannelWithNode) => ({
    icon: { type: 'channel', pubKey: chan.node.pub_key },
    text: chan.node.alias || chan.node.pub_key,
    amount: chan.local_balance
  } as BalanceDetail);

  // add inactive channels
  const inactive = channels
    .filter(chan => chan.status === CHANNEL_STATUS.OPEN && !chan.active)
    .map(channelToDetail);
  addDetailsToGroup(stats.channelDetails, 'Inactive Channel', inactive);

  // add active channels
  const active = channels
    .filter(chan => chan.status === CHANNEL_STATUS.OPEN && chan.active)
    .map(channelToDetail);
  addDetailsToGroup(stats.channelDetails, 'Active Channel', active);

  // add opening channels to pending stats
  const opening = channels
    .filter(chan => chan.status === CHANNEL_STATUS.OPENING)
    .map(channelToDetail);
  addDetailsToGroup(stats.pendingDetails, 'Opening Channel', opening);

  // add opening channels to pending stats
  const closing = channels
    .filter(chan => 
      chan.status === CHANNEL_STATUS.CLOSING ||
      chan.status === CHANNEL_STATUS.FORCE_CLOSING ||
      chan.status === CHANNEL_STATUS.WAITING
    )
    .map(channelToDetail);
  addDetailsToGroup(stats.pendingDetails, 'Closing Channel', closing);
}

function updateFromChain(stats: BalanceStats, utxos: Utxo[]) {
  // helper to map utxo -> BalanceDetail
  const utxoToDetail = (utxo: Utxo) => ({
    icon: { type: 'onchain' },
    text: utxo.address,
    info: `${utxo.confirmations} confirmations`,
    amount: utxo.amount_sat
  } as BalanceDetail);

  // add confirmed utxos to the stats
  const confirmed = utxos
    .filter(u => u.confirmations && u.confirmations !== '0')
    .map(utxoToDetail);
  addDetailsToGroup(stats.onchainDetails, 'Confirmed UTXO', confirmed);

  // add unconfirmed utxos to the stats
  const unconfirmed = utxos
    .filter(u => !u.confirmations)
    .map(utxoToDetail);
  addDetailsToGroup(stats.pendingDetails, 'On-chain Transaction', unconfirmed);
}

function updateTotals(stats: BalanceStats) {
  stats.onchainTotal = sum(stats.onchainDetails, d => d.balance);
  stats.channelTotal = sum(stats.channelDetails, d => d.balance);
  stats.pendingTotal = sum(stats.pendingDetails, d => d.balance);

  stats.spendable = new BN(stats.onchainTotal).add(new BN(stats.channelTotal)).toString();
  stats.total = new BN(stats.spendable).add(new BN(stats.pendingTotal)).toString();

  stats.onchainPercent = new BN(stats.onchainTotal).muln(100).divRound(new BN(stats.total)).toNumber();
  stats.channelPercent = new BN(stats.channelTotal).muln(100).divRound(new BN(stats.total)).toNumber();
  stats.pendingPercent = new BN(stats.pendingTotal).muln(100).divRound(new BN(stats.total)).toNumber();
}

// Helper functions

function addDetailsToGroup(group: BalanceDetailGroup[], title: string, details: BalanceDetail[]) {
  if (details.length) {
    group.push({
      title: `${details.length} ${title}` + (details.length === 1 ? '' : 's'),
      balance: sum(details, c => c.amount),
      details,
    });
  }
}

function sum<T>(collection: T[], selector: (s:T) => string): string {
  // helper func to sum up amounts, given a collection and a
  // fat arrow func returning a numeric value for each item
  // in the collection
  return collection.reduce(
    (aggr, curr) => aggr.add(new BN(selector(curr))), 
    new BN('0')
  ).toString();
}
