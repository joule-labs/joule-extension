import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import './style.less';
import { GetSwapsResponse } from 'lib/loop-http';

interface StateProps {
  swaps: AppState['loop']['swapInfo'];
}

interface OwnProps {
  swap: GetSwapsResponse;
}

type Props = StateProps & OwnProps;

class SwapInfo extends React.Component<Props> {
  render() {
    let pathEl;

    return <div className="SwapInfo">{pathEl}</div>;
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(
  state => ({
    swaps: state.loop.swapInfo,
  }),
  {},
)(SwapInfo);
