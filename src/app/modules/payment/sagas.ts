import { SagaIterator } from 'redux-saga';
import { takeEvery, call, select, put } from 'redux-saga/effects';
import {
  selectNodeLibOrThrow,
  selectNodeInfo,
  getNodeChain,
} from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { getAccountInfo, getTransactions } from 'modules/account/actions';
import { checkPaymentRequest, sendPayment, createInvoice, sendOnChain } from './actions';
import { apiFetchOnChainFees } from 'lib/earn';
import types from './types';
import { CHAIN_TYPE } from 'utils/constants';
import { NoRouteError } from 'lnd/errors';

export function* handleSendPayment(action: ReturnType<typeof sendPayment>) {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(
      selectNodeLibOrThrow,
    );
    const payload = yield call(nodeLib.sendPayment, action.payload);
    yield put({
      type: types.SEND_PAYMENT_SUCCESS,
      payload,
    });
  } catch (err) {
    yield put({
      type: types.SEND_PAYMENT_FAILURE,
      payload: err,
    });
  }
}

export function* handleSendOnChain(action: ReturnType<typeof sendOnChain>) {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(
      selectNodeLibOrThrow,
    );
    const payload = yield call(nodeLib.sendOnChain, action.payload);
    yield put({
      type: types.SEND_ON_CHAIN_SUCCESS,
      payload,
    });
    // fetch the new onchain balance && transactions to update the home screen
    yield put(getAccountInfo());
    yield put(getTransactions());
  } catch (err) {
    yield put({
      type: types.SEND_ON_CHAIN_FAILURE,
      payload: err,
    });
  }
}

export function* handleCreateInvoice(action: ReturnType<typeof createInvoice>) {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(
      selectNodeLibOrThrow,
    );
    const payload = yield call(nodeLib.createInvoice, action.payload);
    yield put({
      type: types.CREATE_INVOICE_SUCCESS,
      payload,
    });
  } catch (err) {
    yield put({
      type: types.CREATE_INVOICE_FAILURE,
      payload: err,
    });
  }
}

export function* handleCheckPaymentRequest(
  action: ReturnType<typeof checkPaymentRequest>,
) {
  const { paymentRequest, amount } = action.payload;
  let nodeLib: Yielded<typeof selectNodeLibOrThrow>;
  let decodedRequest: Yielded<typeof nodeLib.decodePaymentRequest> | undefined;
  let nodeInfo: Yielded<typeof nodeLib.getNodeInfo> | undefined;
  try {
    nodeLib = yield select(selectNodeLibOrThrow);
    decodedRequest = (yield call(
      nodeLib.decodePaymentRequest,
      paymentRequest,
    )) as Yielded<typeof nodeLib.decodePaymentRequest>;
    nodeInfo = (yield call(nodeLib.getNodeInfo, decodedRequest.destination)) as Yielded<
      typeof nodeLib.getNodeInfo
    >;
    const routeInfo: Yielded<typeof nodeLib.queryRoutes> = yield call(
      nodeLib.queryRoutes,
      decodedRequest.destination,
      amount || decodedRequest.num_satoshis || '1',
      { num_routes: 1 },
    );
    yield put({
      type: types.CHECK_PAYMENT_REQUEST_SUCCESS,
      payload: {
        paymentRequest,
        request: decodedRequest,
        node: nodeInfo.node,
        route: routeInfo.routes[0],
      },
    });
  } catch (err) {
    // QueryRoutes doesn't allow hints, so give them the go-ahead if routing
    // fails but the invoice has hints. TODO: Remove once this PR is merged
    // https://github.com/lightningnetwork/lnd/pull/2186
    if (decodedRequest && nodeInfo && err.constructor === NoRouteError) {
      yield put({
        type: types.CHECK_PAYMENT_REQUEST_SUCCESS,
        payload: {
          paymentRequest,
          request: decodedRequest,
          node: nodeInfo.node,
          route: {
            total_amt: '?',
            total_amt_msat: '?',
            total_fees: '?',
            total_fees_msat: '?',
            total_time_lock: '?',
            hops: [],
          },
        },
      });
      return;
    }
    yield put({
      type: types.CHECK_PAYMENT_REQUEST_FAILURE,
      payload: {
        paymentRequest,
        error: err,
      },
    });
  }
}

export function* handleFetchChainFees() {
  try {
    const chain: Yielded<typeof getNodeChain> = yield select(getNodeChain);
    const nodeInfo: Yielded<typeof selectNodeInfo> = yield select(selectNodeInfo);
    const chainType = nodeInfo && !nodeInfo.testnet ? 'mainnet' : 'testnet';
    // the fee estimates API only works for bitcoin mainnet
    if (chain !== CHAIN_TYPE.BITCOIN || chainType !== 'mainnet') {
      throw new Error(`Unable to estimate fees for ${chain} ${chainType}`);
    }

    const rates = yield call(apiFetchOnChainFees);
    yield put({ type: types.FETCH_CHAIN_FEES_SUCCESS, payload: rates });
  } catch (err) {
    yield put({ type: types.FETCH_CHAIN_FEES_FAILURE, payload: err });
  }
}

export default function* paymentSagas(): SagaIterator {
  yield takeEvery(types.SEND_PAYMENT, handleSendPayment);
  yield takeEvery(types.SEND_ON_CHAIN, handleSendOnChain);
  yield takeEvery(types.CREATE_INVOICE, handleCreateInvoice);
  yield takeEvery(types.CHECK_PAYMENT_REQUEST, handleCheckPaymentRequest);
  yield takeEvery(types.FETCH_CHAIN_FEES, handleFetchChainFees);
}
