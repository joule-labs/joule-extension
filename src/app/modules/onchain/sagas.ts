import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { GetUtxosResponse } from 'lib/lnd-http/types';
import types from './types';

export function* handleGetUtxos(): SagaIterator {
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(
      selectNodeLibOrThrow,
    );
    const payload: Yielded<GetUtxosResponse> = yield call(nodeLib.getUtxos);

    yield put({
      type: types.GET_UTXOS_SUCCESS,
      payload: payload.utxos,
    });
  } catch (err) {
    yield put({
      type: types.GET_UTXOS_FAILURE,
      payload: err,
    });
  }
}

export default function* onChainSagas(): SagaIterator {
  yield takeLatest(types.GET_UTXOS, handleGetUtxos);
}
