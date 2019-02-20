import React from 'react';
import { Button } from 'antd';
import { blockchainDisplayName, CHAIN_TYPE } from 'utils/constants';
import './ConfirmNode.less';
import { AppState } from 'store/reducers';
import { connect } from 'react-redux';
import { resetNode } from 'modules/node/actions';
import TitleTemplate
  from 'components/SelectNode/TitleTemplate';

interface StateProps {
  url: AppState['node']['url'];
  nodeInfo: AppState['node']['nodeInfo'];
  adminMacaroon: AppState['node']['adminMacaroon'];
  readonlyMacaroon: AppState['node']['readonlyMacaroon'];
}

interface DispatchProps {
  resetNode: typeof resetNode;
}

interface OwnProps {
  onComplete() : void;
  onCancel() : void;
}

type Props = StateProps & DispatchProps & OwnProps;

class ConfirmNode extends React.Component<Props> {
  render() {
    const {nodeInfo} = this.props;
    let rows : Array<{label: string, value: any}> = [];
    if (!nodeInfo) {
      rows = [{label: 'Error', value: 'Node is not configured yet!'}];
    } else {
      const chain = nodeInfo.chains[0] as CHAIN_TYPE;
      rows = [{
        label: 'Alias',
        value: nodeInfo.alias
      }, {
        label: 'Version',
        value: nodeInfo.version.split(' ')[0]
      }, {
        label: 'Chain',
        value: blockchainDisplayName[chain]
      }, {
        label: 'Testnet',
        value: JSON.stringify(!!nodeInfo.testnet)
      }, {
        label: '# of Channels',
        value: nodeInfo.num_active_channels || 'Unknown'
      }];
    }

    return (
      <div>
        <TitleTemplate title={'Confirm your node'}/>
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
            <Button size="large" type="primary" onClick={this.props.onComplete}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private onCancel = () => {
    this.props.resetNode();
    this.props.onCancel();
  };

}

export default connect<StateProps, DispatchProps, {}, AppState>(
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
