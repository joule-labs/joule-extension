import React from 'react';
import { Button } from 'antd';
import { GetInfoResponse } from 'lib/lnd-http';

interface Props {
  nodeInfo: GetInfoResponse;
  onConfirm(): void;
  onCancel(): void;
}

export default class ConfirmNode extends React.Component<Props> {
  render() {
    const { nodeInfo, onConfirm, onCancel } = this.props;
    const rows = [{
      label: 'Alias',
      value: nodeInfo.alias,
    }, {
      label: 'Version',
      value: nodeInfo.version.split(' ')[0],
    }, {
      label: '# of Channels',
      value: nodeInfo.num_active_channels || 'Unknown'
    }];

    return (
      <div className="ConfirmNode">
        <h1 className="ConfirmNode-title">Confirm your Node</h1>
        <table className="ConfirmNode-info">
          <tbody>
            {rows.map(r => (
              <tr className="ConfirmNode-row" key={r.label}>
                <td className="ConfirmNode-row-label">{r.label}</td>
                <td className="ConfirmNode-row-value">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ConfirmNode-buttons">
          <Button onClick={onConfirm}>
            Confirm
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }
}