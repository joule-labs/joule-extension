import reducers, { PeersState, INITIAL_STATE } from './reducers';
import * as peersActions from './actions';
import * as peersTypes from './types';
import peersSagas from './sagas';

export { peersActions, peersTypes, peersSagas, PeersState, INITIAL_STATE };

export default reducers;
