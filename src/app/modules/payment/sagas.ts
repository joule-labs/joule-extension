import { SagaIterator } from 'redux-saga';
import { takeEvery, call, all, select, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { checkPaymentRequest, sendPayment, createInvoice } from './actions';
import types from './types';

export function* handleSendPayment(action: ReturnType<typeof sendPayment>): SagaIterator {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const payload = yield call(nodeLib.sendPayment, action.payload);
    yield put({
      type: types.SEND_PAYMENT_SUCCESS,
      payload,
    });
  } catch(err) {
    yield put({
      type: types.SEND_PAYMENT_FAILURE,
      payload: err,
    });
  }
}

export function* handleCreateInvoice(action: ReturnType<typeof createInvoice>): SagaIterator {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const payload = yield call(nodeLib.createInvoice, action.payload);
    yield put({
      type: types.CREATE_INVOICE_SUCCESS,
      payload,
    });
  } catch(err) {
    yield put({
      type: types.CREATE_INVOICE_FAILURE,
      payload: err,
    });
  }
}

export function* handleCheckPaymentRequest(action: ReturnType<typeof checkPaymentRequest>): SagaIterator {
  const paymentRequest = action.payload;
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const decodedRequest: Yielded<typeof nodeLib.decodePaymentRequest> = yield call(nodeLib.decodePaymentRequest, paymentRequest);
    const [nodeInfo, routeInfo] = yield all([
      call(nodeLib.getNodeInfo, decodedRequest.destination),
      call(
        nodeLib.queryRoutes,
        decodedRequest.destination,
        decodedRequest.num_satoshis,
        { num_routes: 1 },
      ),
    ]);
    yield put({
      type: types.CHECK_PAYMENT_REQUEST_SUCCESS,
      payload: {
        paymentRequest,
        request: decodedRequest,
        node: nodeInfo.node,
        route: routeInfo.routes[0],
      },
    });
  } catch(err) {
    yield put({
      type: types.CHECK_PAYMENT_REQUEST_FAILURE,
      payload: {
        paymentRequest,
        error: err,
      },
    });
  }
}

export default function* paymentSagas(): SagaIterator {
  yield takeEvery(types.SEND_PAYMENT, handleSendPayment);
  yield takeEvery(types.CREATE_INVOICE, handleCreateInvoice);
  yield takeEvery(types.CHECK_PAYMENT_REQUEST, handleCheckPaymentRequest);
}
