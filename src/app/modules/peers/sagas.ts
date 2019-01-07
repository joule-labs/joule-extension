import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, all, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { safeGetNodeInfo } from 'utils/misc';
import types from './types';

export function* handleGetPeers(): SagaIterator {
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const { peers }: Yielded<typeof nodeLib.getPeers> = yield call(nodeLib.getPeers);
    const nodes: Array<Yielded<typeof nodeLib.getNodeInfo>> = yield all(
      peers.map(p => call(safeGetNodeInfo, nodeLib, p.pub_key))
    );
    const payload = peers.map((peer, i) => ({
      ...peer,
      node: nodes[i].node,
    }));
    yield put({
      type: types.GET_PEERS_SUCCESS,
      payload,
    });
  } catch(err) {
    yield put({
      type: types.GET_PEERS_FAILURE,
      payload: err,
    });
  }
}

export default function* channelsSagas(): SagaIterator {
  yield takeLatest(types.GET_PEERS, handleGetPeers);
}