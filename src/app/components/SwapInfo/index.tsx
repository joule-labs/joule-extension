import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './style.less';
import { SwapResponse } from 'lib/loop-http';
import moment from 'moment';
import { LOOP_TYPE } from 'utils/constants';

interface StateProps {
  swapInfo: AppState['loop']['swapInfo'];
}

interface OwnProps {
  swap: SwapResponse;
}

type Props = StateProps & OwnProps;

class SwapInfo extends React.Component<Props> {
  render() {
    const { swap } = this.props;

    const update = parseInt(swap.last_update_time, 10);
    return (
      <div className="SwapInfo">
        <div>
          <p>Type: {swap.type === 'LOOP_IN' ? LOOP_TYPE.LOOP_IN : LOOP_TYPE.LOOP_OUT}</p>
          <p>Updated: {moment.unix(update / 1000000).format('MMM Do, LT')} </p>
          <p>HTLC: {swap.htlc_address}</p>
          <p>On-chain Cost: {swap.cost_onchain} sats</p>
          <p>Off-chain Cost: {swap.cost_offchain} sats</p>
          <p>Server Cost: {swap.cost_server} sats</p>
          <p>Id: {swap.id}</p>
        </div>
      </div>
    );
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(
  state => ({
    swapInfo: state.loop.swapInfo,
  }),
  {},
)(SwapInfo);
