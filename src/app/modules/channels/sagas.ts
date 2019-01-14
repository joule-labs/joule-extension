import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, all, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import { safeGetNodeInfo } from 'utils/misc';
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
    console.log(payload);
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

export default function* channelsSagas(): SagaIterator {
  yield takeLatest(types.GET_CHANNELS, handleGetChannels);
}