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
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="large" type="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    )
  }
}