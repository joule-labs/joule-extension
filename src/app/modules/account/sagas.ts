import { takeLatest, select, call, all, put } from 'typed-redux-saga/macro';
import BN from 'bn.js';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { getNodePubKey } from 'modules/node/sagas';
import { requirePassword } from 'modules/crypto/sagas';
import { safeGetNodeInfo, UNKNOWN_NODE } from 'utils/misc';
import types, { Account } from './types';
import { getDepositAddress } from './actions';
import { getPaymentRecipientPubkey } from 'utils/lnd-shims';

export function* handleGetAccountInfo() {
  try {
    const myPubKey: string = yield call(getNodePubKey);
    const nodeLib = yield* select(selectNodeLibOrThrow);
    const calls = [
      call(nodeLib.getNodeInfo, myPubKey),
      call(nodeLib.getBlockchainBalance),
      call(nodeLib.getChannelsBalance),
    ] as const;
    const [nodeInfo, chainBalances, channelsBalances] = yield* all(calls);
    const payload: Account = {
      pubKey: myPubKey,
      alias: nodeInfo.node.alias,
      color: nodeInfo.node.color,
      blockchainBalance: chainBalances.confirmed_balance,
      blockchainBalancePending: chainBalances.total_balance,
      channelBalance: channelsBalances.balance,
      channelBalancePending: new BN(channelsBalances.balance)
        .add(new BN(channelsBalances.pending_open_balance))
        .toString(),
      totalBalance: new BN(chainBalances.confirmed_balance)
        .add(new BN(channelsBalances.balance))
        .toString(),
      totalBalancePending: new BN(chainBalances.total_balance)
        .add(new BN(channelsBalances.balance))
        .add(new BN(channelsBalances.pending_open_balance))
        .toString(),
    };
    yield put({
      type: types.GET_ACCOUNT_INFO_SUCCESS,
      payload,
    });
  } catch (err) {
    yield put({
      type: types.GET_ACCOUNT_INFO_FAILURE,
      payload: err,
    });
  }
}

export function* handleGetTransactions() {
  try {
    // Get various transactions info
    const nodeLib = yield* select(selectNodeLibOrThrow);
    const [paymentsRes, invoicesRes, transactionsRes] = yield* all([
      call(nodeLib.getPayments),
      call(nodeLib.getInvoices, { num_max_invoices: 30, reversed: true }),
      call(nodeLib.getTransactions),
    ] as const);

    // Get node information from payments
    const paymentNodeIds = paymentsRes.payments
      .map(getPaymentRecipientPubkey)
      .filter((id): id is string => !!id)
      .filter((id, idx, ids) => ids.indexOf(id) === idx);
    const paymentNodes = yield* all(
      paymentNodeIds.map(id => call(safeGetNodeInfo, nodeLib, id)),
    );
    const payments = paymentsRes.payments
      .map(p => {
        // Handle payments that may be missing a path
        const pubkey = getPaymentRecipientPubkey(p);
        if (!pubkey) {
          return {
            ...p,
            to: UNKNOWN_NODE,
          };
        }
        const nodeResponse = paymentNodes.find(n => pubkey === n.node.pub_key);
        return {
          ...p,
          to: (nodeResponse as any).node,
        };
      })
      .map(p => {
        // Fix old style payments that only had `value`
        if (!p.value_sat && !p.value_msat) {
          return {
            ...p,
            value_sat: (p as any).value,
            value_msat: `${(p as any).value}000`,
          };
        }
        return p;
      });

    yield put({
      type: types.GET_TRANSACTIONS_SUCCESS,
      payload: {
        payments,
        invoices: invoicesRes.invoices,
        transactions: transactionsRes.transactions,
      },
    });
  } catch (err) {
    yield put({
      type: types.GET_TRANSACTIONS_FAILURE,
      payload: err,
    });
  }
}

export function* handleGetDepositAddress(action: ReturnType<typeof getDepositAddress>) {
  try {
    yield call(requirePassword);
    const nodeLib = yield* select(selectNodeLibOrThrow);
    const res = yield* call(nodeLib.getAddress, action.payload);
    yield put({
      type: types.GET_DEPOSIT_ADDRESS_SUCCESS,
      payload: res.address,
    });
  } catch (err) {
    yield put({
      type: types.GET_DEPOSIT_ADDRESS_FAILURE,
      payload: err,
    });
  }
}

export default function* channelsSagas() {
  yield takeLatest(types.GET_ACCOUNT_INFO, handleGetAccountInfo);
  yield takeLatest(types.GET_TRANSACTIONS, handleGetTransactions);
  yield takeLatest(types.GET_DEPOSIT_ADDRESS, handleGetDepositAddress);
}
