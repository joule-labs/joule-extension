import React from 'react';
import BN from 'bn.js';
import classnames from 'classnames';
import Identicon from 'components/Identicon';
import Unit from 'components/Unit';
import { ChannelWithNode } from 'modules/channels/types';
import './ChannelRow.less';

interface Props {
  channel: ChannelWithNode;
  onClick?(channel: ChannelWithNode): void;
}

export default class ChannelRow extends React.Component<Props> {
  render() {
    const { channel, onClick } = this.props;
    const capacityPct = new BN(channel.local_balance)
      .muln(100)
      .div(new BN(channel.capacity))
      .toString();

    return (
      <div
        className={classnames("ChannelRow", onClick && 'is-clickable')}
        onClick={this.handleClick}
      >
        <Identicon
          className="ChannelRow-avatar"
          pubkey={channel.remote_pubkey}
        />
        <div className="ChannelRow-info">
          <div className="ChannelRow-info-alias">
            {channel.node.alias}
          </div>
          <div className="ChannelRow-info-pubkey">
            <code>{channel.node.pub_key}</code>
          </div>
          <div className="ChannelRow-info-balance">
            Balance: <Unit value={channel.local_balance} hideUnit />
            {' / '}
            <Unit value={channel.capacity} />
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