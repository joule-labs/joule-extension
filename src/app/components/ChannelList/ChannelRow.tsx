import React from 'react';
import BN from 'bn.js';
import classnames from 'classnames';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import { Tooltip }from 'antd';
import { ChannelWithNode } from 'modules/channels/types';
import './ChannelRow.less';

interface Props {
  channel: ChannelWithNode;
  status: "active" | "inactive" | "opening" | "closing";
  pubkey: string;
  onClick?(channel: ChannelWithNode): void;
}

export default class ChannelRow extends React.Component<Props> {
  render() {
    const { pubkey,  status, channel, onClick } = this.props;
    const icon = <Identicon className="ChannelRow-avatar-img" pubkey={pubkey} />
    const capacityPct = new BN(channel.local_balance)
      .muln(100)
      .div(new BN(channel.capacity))
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
            {channel.node.alias}
          </div>
          <div className="ChannelRow-info-pubkey">
            <code>{channel.node.pub_key?channel.node.pub_key:
                   channel.channel.remote_node_pub}</code>
          </div>

          <div className="ChannelRow-info-balance">
            Balance: <Unit value={channel.local_balance} hideUnit />
            {' / '}
            <Unit value={channel.capacity!=="1"? channel.capacity
            :channel.channel.capacity}/>
          </div>
           <div className="ChannelRow-info-balance">
           {channel.blocks_til_maturity>0&&
            `Refund for ${channel.limbo_balance} satoshis in 
            ${channel.blocks_til_maturity} blocks`}
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
      this.props.onClick(this.props.channel);
    }
  };
}