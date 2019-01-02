import React from 'react';
import BN from 'bn.js';
import classnames from 'classnames';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import './ChannelRow.less';
import { Tooltip }from 'antd';
import { PendingOpenChannelWithNode } from 'modules/channels/types';

interface Props {
  pendingOpenChannel: PendingOpenChannelWithNode;
  status: "opening";
  pubkey: string;
  onClick?(channel: PendingOpenChannelWithNode): void;
}

export default class PendginOpenChannelRow extends React.Component<Props> {
  render() {
    const { pubkey,  status, pendingOpenChannel, onClick } = this.props;
    const icon = <Identicon className="ChannelRow-avatar-img" pubkey={pubkey} />
    const capacityPct = new BN(pendingOpenChannel.channel.local_balance)
      .muln(100)
      .div(new BN(pendingOpenChannel.channel.capacity))
      .toString();

    return (
      <div
        className={classnames("ChannelRow", onClick && 'is-clickable')}
        onClick={this.handleClick}
      >
        <div className="ChannelRow-avatar">
          {icon}
          <Tooltip title={status}>
            <div className={`ChannelRow-avatar-status is-${status}`} />
          </Tooltip>
        </div>
        <div className="ChannelRow-info">
          <div className="ChannelRow-info-alias">
          {pendingOpenChannel.node.alias}
          </div>
          <div className="ChannelRow-info-pubkey">
            <code>{pendingOpenChannel.channel.remote_node_pub}</code>
          </div>
          <div className="ChannelRow-info-balance">
            Balance: <Unit value={pendingOpenChannel.channel.local_balance} hideUnit />
            {' / '}
            <Unit value={pendingOpenChannel.channel.capacity} />
          </div>
          <div className="ChannelRow-info-progress">
            <div className="ChannelRow-info-progress-inner" style={{ width: `${capacityPct}%` }}/>
          </div>
        </div>
      </div>
    );
  }

  private handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.pendingOpenChannel);
    }
  };
}