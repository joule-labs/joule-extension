import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';
import LoopSetup from './LoopSetup';
import LoopForm from './LoopForm';
import './index.less';

interface StateProps {
  isCheckingLoop: AppState['loop']['isCheckingLoop'];
  url: AppState['loop']['url'];
}

type Props = StateProps;

class Loop extends React.Component<Props> {
  render() {
    const { url, isCheckingLoop } = this.props;

    return (
      <div className="Loop">{url && !isCheckingLoop ? <LoopForm /> : <LoopSetup />}</div>
    );
  }
}

export default connect<StateProps, {}, {}, AppState>(state => ({
  isCheckingLoop: state.loop.isCheckingLoop,
  url: state.loop.url,
}))(Loop);
