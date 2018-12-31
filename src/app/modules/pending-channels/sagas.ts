import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, all, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import types from './types';

export function* handleGetPendingChannels(): SagaIterator {
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);

    const { pending_force_closing_channels }: Yielded<typeof nodeLib.getPendingChannels> = yield call(nodeLib.getPendingChannels);
    const { waiting_close_channels }: Yielded<typeof nodeLib.getPendingChannels> = yield call(nodeLib.getPendingChannels);
    const { pending_open_channels }: Yielded<typeof nodeLib.getPendingChannels> = yield call(nodeLib.getPendingChannels);
    // FC - force closing, WC -- waiting closing, PO -- pending open
    const channelsNodeInfoFC: Array<Yielded<typeof nodeLib.getNodeInfo>> = yield all(
      pending_force_closing_channels.map(channel => call(nodeLib.getNodeInfo, channel.channel.remote_node_pub))
    );

    const channelsNodeInfoWC: Array<Yielded<typeof nodeLib.getNodeInfo>> = yield all(
      waiting_close_channels.map(channel => call(nodeLib.getNodeInfo, channel.channel.remote_node_pub))
    );

    const channelsNodeInfoPO: Array<Yielded<typeof nodeLib.getNodeInfo>> = yield all(
      pending_open_channels.map(channel => call(nodeLib.getNodeInfo, channel.channel.remote_node_pub))
    );

    const payloadFC = pending_force_closing_channels.map((channel, i) => ({
      ...channel,
      node: channelsNodeInfoFC[i].node
    }));

    const payloadWC = waiting_close_channels.map((channel, i) => ({
      ...channel,
      node: channelsNodeInfoWC[i].node,
    }));

    const payloadPO = pending_open_channels.map((channel, i) => ({
      ...channel,
      node: channelsNodeInfoPO[i].node,
    }));

    yield put({
      type: types.GET_PENDING_CHANNELS_SUCCESS,
      payloadFC,
      payloadWC,
      payloadPO
    });
  } catch(err) {
    yield put({
      type: types.GET_PENDING_CHANNELS_FAILURE,
      payload: err,
    });
  }
}

export default function* pendingChannelsSagas(): SagaIterator {
  yield takeLatest(types.GET_PENDING_CHANNELS, handleGetPendingChannels);
}