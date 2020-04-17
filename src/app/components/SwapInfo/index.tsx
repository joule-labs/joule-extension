import React from 'react';
import { connect } from 'react-redux';
import { Timeline, Icon } from 'antd';
import { getAccountInfo } from 'modules/account/actions';
import { AnyTransaction } from 'modules/account/types';
import { AppState } from 'store/reducers';
import './style.less';

interface StateProps {
  account: AppState['account']['account'];
  node: AppState['node']['nodeInfo'];
}

interface DispatchProps {
  getAccountInfo: typeof getAccountInfo;
}

interface OwnProps {
  tx: AnyTransaction;
}

type Props = StateProps & DispatchProps & OwnProps;

class SwapInfo extends React.Component<Props> {
  componentWillMount() {
    if (!this.props.account) {
      this.props.getAccountInfo();
    }
  }

  render() {
    const { tx, account, node } = this.props;
    if (!account) {
      return null;
    }

    let pathEl;

    return <div className="SwapInfo">{pathEl}</div>;
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    account: state.account.account,
    node: state.node.nodeInfo,
  }),
  { getAccountInfo },
)(SwapInfo);
