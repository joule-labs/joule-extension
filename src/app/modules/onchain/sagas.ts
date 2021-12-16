import { takeLatest, select, call, put } from 'typed-redux-saga';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import types from './types';

export function* handleGetUtxos() {
  try {
    const nodeLib = yield* select(selectNodeLibOrThrow);
    const payload = yield* call(nodeLib.getUtxos);

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

export default function* onChainSagas() {
  yield takeLatest(types.GET_UTXOS, handleGetUtxos);
}
