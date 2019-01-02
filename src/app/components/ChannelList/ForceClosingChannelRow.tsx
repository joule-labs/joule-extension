import React from 'react';
import BN from 'bn.js';
import classnames from 'classnames';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import './ChannelRow.less';
import { Tooltip }from 'antd';
import { ForceClosingChannelWithNode } from 'modules/channels/types';

interface Props {
  forceClosingChannel: ForceClosingChannelWithNode;
  status: "closing";
  pubkey: string;
  onClick?(channel: ForceClosingChannelWithNode): void;
}

export default class ForceClosingChannelRow extends React.Component<Props> {
  render() {
    const { pubkey,  status, forceClosingChannel, onClick } = this.props;
    const icon = <Identicon className="ChannelRow-avatar-img" pubkey={pubkey} />
    const capacityPct = new BN(forceClosingChannel.channel.local_balance)
      .muln(100)
      .div(new BN(forceClosingChannel.channel.capacity))
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
          {forceClosingChannel.node.alias}
          </div>
          <div className="ChannelRow-info-pubkey">
            <code>{forceClosingChannel.channel.remote_node_pub}</code>
          </div>
          <div className="ChannelRow-info-balance">
            Balance: <Unit value={forceClosingChannel.channel.local_balance} hideUnit />
            {' / '}
            <Unit value={forceClosingChannel.channel.capacity} />
          </div>
          <div className="ChannelRow-info-balance">
            <code>Blocks Until Maturity: {forceClosingChannel.blocks_til_maturity}</code>
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
      this.props.onClick(this.props.forceClosingChannel);
    }
  };
}