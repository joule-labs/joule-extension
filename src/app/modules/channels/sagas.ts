import { SagaIterator } from 'redux-saga';
import { takeLatest, select, call, all, put } from 'redux-saga/effects';
import { selectNodeLibOrThrow } from 'modules/node/selectors';
import types from './types';

export function* handleGetChannels(): SagaIterator {
  try {
    const nodeLib: Yielded<typeof selectNodeLibOrThrow> = yield select(selectNodeLibOrThrow);
    const { channels }: Yielded<typeof nodeLib.getChannels> = yield call(nodeLib.getChannels);
    const channelsNodeInfo: Array<Yielded<typeof nodeLib.getNodeInfo>> = yield all(
      channels.map(channel => call(nodeLib.getNodeInfo, channel.remote_pubkey))
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

export default function* channelsSagas(): SagaIterator {
  yield takeLatest(types.GET_CHANNELS, handleGetChannels);
}