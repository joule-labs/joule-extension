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
    const nano = 1000000000;

    const update = parseInt(swap.last_update_time, 10);
    return (
      <div className="SwapInfo">
        <div>
          <p>
            <code>
              {swap.type === 'LOOP_IN' ? LOOP_TYPE.LOOP_IN : LOOP_TYPE.LOOP_OUT} last
              updated on {moment.unix(update / nano).format('MMM Do, LT')}{' '}
            </code>
          </p>
          <p>
            <code>HTLC: {swap.htlc_address}</code>
          </p>
          <p>
            <code>On-chain cost: {swap.cost_onchain} sats</code>
          </p>
          <p>
            <code>Off-chain Cost: {swap.cost_offchain} sats</code>
          </p>
          <p>
            <code>Server Cost: {swap.cost_server} sats</code>
          </p>
          <p>
            <code>Id: {swap.id}</code>
          </p>
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
