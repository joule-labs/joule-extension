import React from 'react';
import BN from 'bn.js';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import { enumToClassName } from 'utils/formatters';
import { channelStatusText } from 'utils/constants';
import { ChannelWithNode } from 'modules/channels/types';
import { CHANNEL_STATUS } from 'lib/lnd-http';
import './ChannelRow.less';

interface Props {
  channel: ChannelWithNode;
  onClick?(channel: ChannelWithNode): void;
}

export default class ChannelRow extends React.Component<Props> {
  render() {
    const { channel, onClick } = this.props;
    const { local_balance, capacity, node } = channel;
    const capacityPct = new BN(local_balance)
      .muln(100)
      .div(new BN(capacity))
      .toString();

    let tooltipText = channelStatusText[channel.status];
    if (channel.status === CHANNEL_STATUS.FORCE_CLOSING) {
      tooltipText = `${tooltipText} (in ${channel.blocks_til_maturity} blocks)`;
    } else if (channel.status === CHANNEL_STATUS.OPEN && !channel.active) {
      tooltipText = `${tooltipText} (offline)`;
    }

    let statusClass = `is-${enumToClassName(channel.status)}`;
    if (channel.status === CHANNEL_STATUS.OPEN) {
      statusClass = `${statusClass} is-${channel.active ? 'active' : 'inactive'}`;
    }

    return (
      <div
        className={classnames('ChannelRow', onClick && 'is-clickable')}
        onClick={this.handleClick}
      >
        <div className="ChannelRow-avatar">
          <Identicon className="ChannelRow-avatar-img" pubkey={node.pub_key} />
          <Tooltip title={tooltipText}>
            <div className={classnames('ChannelRow-avatar-status', statusClass)} />
          </Tooltip>
        </div>
        <div className="ChannelRow-info">
          <div className="ChannelRow-info-alias">{node.alias}</div>
          <div className="ChannelRow-info-pubkey">
            <code>{node.pub_key}</code>
          </div>

          <div className="ChannelRow-info-balance">
            Balance: <Unit value={local_balance} hideUnit />
            {' / '}
            <Unit value={channel.capacity} />
          </div>
          <div className="ChannelRow-info-progress">
            <div
              className="ChannelRow-info-progress-inner"
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  private handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.channel);
    }
  };
}
