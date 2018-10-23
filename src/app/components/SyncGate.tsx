import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { AppState } from 'store/reducers';


interface StateProps {
  isSyncing: AppState['sync']['isSyncing'];
  hasSynced: AppState['sync']['hasSynced'];
}

interface OwnProps {
  children: React.ReactNode;
}

type Props = StateProps & OwnProps;

class SyncGate extends React.Component<Props> {
  render() {
    const { hasSynced, isSyncing, children } = this.props;

    if (isSyncing) {
      return null;
    } else if (hasSynced) {
      return children;
    } else {
      return 'Aww sheeeit, something went wrong syncing';
    }
  }
}

export default connect<StateProps, {}, OwnProps, AppState>(
  state => ({
    isSyncing: state.sync.isSyncing,
    hasSynced: state.sync.hasSynced,
  })
)(SyncGate);