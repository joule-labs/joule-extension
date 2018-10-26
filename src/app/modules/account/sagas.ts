import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, all, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { getNodePubKey } from 'modules/node/sagas';
import types, { Account } from './types';

export function* handleGetAccountInfo(): SagaIterator {
  try {
    const myPubKey: string = yield call(getNodePubKey);
    const nodeLib: ReturnType<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const calls = [
      call(nodeLib.getNodeInfo, myPubKey),
      call(nodeLib.getBlockchainBalance),
      call(nodeLib.getChannelsBalance),
      // call(nodeLib.getAddress),
    ];
    const [nodeInfo, chainBalances, channelsBalances, addressResponse] = yield all(calls);
    const payload: Account = {
      pubKey: myPubKey,
      alias: nodeInfo.node.alias,
      color: nodeInfo.node.color,
      blockchainBalance: chainBalances.confirmed_balance,
      blockchainBalancePending: chainBalances.total_balance,
      channelBalance: channelsBalances.balance,
      channelBalancePending: channelsBalances.pending_open_balance,
      chainAddress: '',
      // chainAddress: addressResponse.address,
    };
    yield put({
      type: types.GET_ACCOUNT_INFO_SUCCESS,
      payload,
    });
  } catch(err) {
    yield put({
      type: types.GET_ACCOUNT_INFO_FAILURE,
      payload: err,
    });
  }
}

export function* handleGetTransactions(): SagaIterator {
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const [paymentsRes, invoicesRes, transactionsRes] = yield all([
      call(nodeLib.getPayments),
      call(nodeLib.getInvoices, { num_max_invoices: 30 }),
      call(nodeLib.getTransactions),
    ]);
    yield put({
      type: types.GET_TRANSACTIONS_SUCCESS,
      payload: {
        payments: paymentsRes.payments,
        invoices: invoicesRes.invoices,
        transactions: transactionsRes.transactions,
      },
    });
  } catch(err) {
    yield put({
      type: types.GET_TRANSACTIONS_FAILURE,
      payload: err,
    });
  }
}

export default function* channelsSagas(): SagaIterator {
  yield takeLatest(types.GET_ACCOUNT_INFO, handleGetAccountInfo);
  yield takeLatest(types.GET_TRANSACTIONS, handleGetTransactions);
}