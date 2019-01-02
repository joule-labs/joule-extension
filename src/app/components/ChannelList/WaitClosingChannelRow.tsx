import React from 'react';
import BN from 'bn.js';
import classnames from 'classnames';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import { WaitClosingChannelWithNode } from 'modules/channels/types';

import './ChannelRow.less';
import { Tooltip }from 'antd';

interface Props {
  waitClosingChannel: WaitClosingChannelWithNode;
  status: "closing";
  pubkey: string;
  onClick?(channel: WaitClosingChannelWithNode): void;
}

export default class WaitClosingChannelRow extends React.Component<Props> {
  render() {
    const { pubkey,  status, waitClosingChannel, onClick } = this.props;
    const icon = <Identicon className="ChannelRow-avatar-img" pubkey={pubkey} />
    const capacityPct = new BN(waitClosingChannel.channel.local_balance)
      .muln(100)
      .div(new BN(waitClosingChannel.channel.capacity))
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
          {waitClosingChannel.node.alias}
          </div>
          <div className="ChannelRow-info-pubkey">
            <code>{waitClosingChannel.channel.remote_node_pub}</code>
          </div>
          <div className="ChannelRow-info-balance">
            Balance: <Unit value={waitClosingChannel.channel.local_balance} hideUnit />
            {' / '}
            <Unit value={waitClosingChannel.channel.capacity} />
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
      this.props.onClick(this.props.waitClosingChannel);
    }
  };
}