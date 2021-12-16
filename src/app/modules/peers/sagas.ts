import { takeLatest, select, call, all, put } from 'typed-redux-saga';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { safeGetNodeInfo, safeConnectPeer } from 'utils/misc';
import { addPeer } from './actions';
import types from './types';

export function* handleGetPeers() {
  try {
    const nodeLib = yield* select(selectNodeLibOrThrow);
    const { peers } = yield* call(nodeLib.getPeers);
    const nodes = yield* all(peers.map(p => call(safeGetNodeInfo, nodeLib, p.pub_key)));
    const payload = peers.map((peer, i) => ({
      ...peer,
      node: nodes[i].node,
    }));
    yield put({
      type: types.GET_PEERS_SUCCESS,
      payload,
    });
  } catch (err) {
    yield put({
      type: types.GET_PEERS_FAILURE,
      payload: err,
    });
  }
}

export function* handleAddPeer(action: ReturnType<typeof addPeer>) {
  try {
    yield call(requirePassword);
    const nodeLib = yield* select(selectNodeLibOrThrow);
    yield call(safeConnectPeer, nodeLib, action.payload);
    yield call(handleGetPeers);
    yield put({ type: types.ADD_PEER_SUCCESS });
  } catch (err) {
    yield put({
      type: types.ADD_PEER_FAILURE,
      payload: err,
    });
  }
}

export default function* channelsSagas() {
  yield takeLatest(types.GET_PEERS, handleGetPeers);
  yield takeLatest(types.ADD_PEER, handleAddPeer);
}
