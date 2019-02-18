import React from 'react';
import { Button } from 'antd';
import { blockchainDisplayName, CHAIN_TYPE } from 'utils/constants';
import './ConfirmNode.less';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import { resetNode } from 'modules/node/actions';
import { RouteComponentProps, withRouter } from 'react-router';

interface StateProps {
  url: AppState['node']['url'];
  nodeInfo: AppState['node']['nodeInfo'];
  adminMacaroon: AppState['node']['adminMacaroon'];
  readonlyMacaroon: AppState['node']['readonlyMacaroon'];
}

interface DispatchProps {
  resetNode: typeof resetNode;
}

type Props = StateProps & DispatchProps & RouteComponentProps;

class ConfirmNode extends React.Component<Props> {
  render() {
    const {nodeInfo} = this.props;
    const chain = nodeInfo!.chains[0] as CHAIN_TYPE;
    const rows = [{
      label: 'Alias',
      value: nodeInfo!.alias
    }, {
      label: 'Version',
      value: nodeInfo!.version.split(' ')[0]
    }, {
      label: 'Chain',
      value: blockchainDisplayName[chain]
    }, {
      label: 'Testnet',
      value: JSON.stringify(!!nodeInfo!.testnet)
    }, {
      label: '# of Channels',
      value: nodeInfo!.num_active_channels || 'Unknown'
    }];

    return (
      <div>
        <h2 className="SelectNode-title">Confirm your node</h2>
        <div className="ConfirmNode">
          <table className="ConfirmNode-info">
            <tbody>
            {rows.map(r => (
              <tr className="ConfirmNode-info-row" key={r.label}>
                <td className="ConfirmNode-info-row-label">{r.label}</td>
                <td className="ConfirmNode-info-row-value">{r.value}</td>
              </tr>
            ))}
            </tbody>
          </table>
          <div className="ConfirmNode-buttons">
            <Button size="large" onClick={this.onCancel}>
              Cancel
            </Button>
            <Button size="large" type="primary" onClick={this.onConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private onCancel = () => {
    this.props.resetNode();
    this.props.history.replace('/onboarding-node');
  };

  private onConfirm = () => {
    this.props.history.push('/onboarding-password');
  };

}

const ConnectedConfirmNode = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    url: state.node.url,
    nodeInfo: state.node.nodeInfo,
    adminMacaroon: state.node.adminMacaroon,
    readonlyMacaroon: state.node.readonlyMacaroon
  }),
  {
    resetNode
  }
)(ConfirmNode);

export default withRouter(ConnectedConfirmNode);