import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, all, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { requirePassword } from 'modules/crypto/sagas';
import { safeGetNodeInfo, safeConnectPeer, sleep } from 'utils/misc';
import { openChannel } from './actions';
import types from './types';

export function* handleGetChannels(): SagaIterator {
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow>
      = yield select(selectNodeLibOrThrow);
    // Destructure all channels for asynchronous calling
    const [{ channels },
    {pending_force_closing_channels,
    pending_open_channels,
    waiting_close_channels}] :
    [Yielded <typeof nodeLib.getChannels>,
    Yielded <typeof nodeLib.getPendingChannels>]
     = yield all([
       call(nodeLib.getChannels),
       call(nodeLib.getPendingChannels)]);
    // Map all channels node info together
    const channelsNodeInfo: Array<Yielded<typeof nodeLib.getNodeInfo>> = yield all(
      channels.map(channel =>
        call(safeGetNodeInfo, nodeLib, channel.remote_pubkey))
        .concat(pending_force_closing_channels.map(channel =>
          call(safeGetNodeInfo, nodeLib, channel.channel.remote_node_pub)))
        .concat(waiting_close_channels.map(channel =>
          call(safeGetNodeInfo, nodeLib, channel.channel.remote_node_pub)))
        .concat(pending_open_channels.map(channel =>
          call(safeGetNodeInfo, nodeLib, channel.channel.remote_node_pub)))
    );
    // Map all channels together with node info
    const allChannels = channels
      .concat(pending_force_closing_channels)
      .concat(waiting_close_channels)
      .concat(pending_open_channels)
    const payload = allChannels.map((channel, i) => ({
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