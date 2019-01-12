import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, all, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { safeGetNodeInfo, safeConnectPeer, sleep } from 'utils/misc';
import { openChannel } from './actions';
import types from './types';

export function* handleGetChannels(): SagaIterator {
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const { channels }: Yielded<typeof nodeLib.getChannels> = yield call(nodeLib.getChannels);
    const channelsNodeInfo: Array<Yielded<typeof nodeLib.getNodeInfo>> = yield all(
      channels.map(channel => call(safeGetNodeInfo, nodeLib, channel.remote_pubkey))
    );
    const payload = channels.map((channel, i) => ({
      ...channel,
      node: channelsNodeInfo[i].node,
    }));
    yield put({
      type: types.GET_CHANNELS_SUCCESS,
      payload,
    });
  } catch(err) {
    yield put({
      type: types.GET_CHANNELS_FAILURE,
      payload: err,
    });
  }
}

export function* handleOpenChannel(action: ReturnType<typeof openChannel>): SagaIterator {
  try {
    yield call(requirePassword);
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);

    // Connect to peer and wait a sec just in case we weren't already
    yield call(safeConnectPeer, nodeLib, action.payload.address);
    yield call(sleep, 2000);

    // Construct open channel params and send
    const openParams = {
      node_pubkey_string: action.payload.address.split('@')[0],
      local_funding_amount: action.payload.capacity,
      private: action.payload.isPrivate,
      push_sat: action.payload.pushAmount,
    };
    const res: Yielded<typeof nodeLib.openChannel> = yield call(
      nodeLib.openChannel, openParams
    );
    yield put({
      type: types.OPEN_CHANNEL_SUCCESS,
      payload: {
        address: action.payload.address,
        txid: res.funding_txid_str,
        index: res.output_index,
      },
    });
  } catch(err) {
    yield put({
      type: types.OPEN_CHANNEL_FAILURE,
      payload: err,
    })
  }
}

export default function* channelsSagas(): SagaIterator {
  yield takeLatest(types.GET_CHANNELS, handleGetChannels);
  yield takeLatest(types.OPEN_CHANNEL, handleOpenChannel);
}